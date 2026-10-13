
import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpPurpose } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import { generateOtp, hashOtp } from '../utils/otp.util.js';
import { verifyOtpHash } from '../utils/otp.util.js';
@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async issue(userId: string, email: string, purpose: OtpPurpose) {
  const pepper = this.config.get<string>('OTP_PEPPER');

  if (!pepper || pepper.length < 32) {
    throw new Error('OTP_PEPPER must be configured securely');
  }

  const now = new Date();

  const recentCount = await this.prisma.otpChallenge.count({
    where: {
      userId,
      purpose,
      createdAt: {
        gt: new Date(now.getTime() - 15 * 60 * 1000),
      },
    },
  });

  if (recentCount >= 3) {
    throw new HttpException(
      'Please wait before requesting another code',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  const code = generateOtp();

  // Invalidate any previous, unused codes for this purpose.
  await this.prisma.otpChallenge.updateMany({
    where: {
      userId,
      purpose,
      consumedAt: null,
    },
    data: {
      consumedAt: now,
    },
  });

  const challenge = await this.prisma.otpChallenge.create({
    data: {
      userId,
      purpose,
      codeHash: hashOtp(code, pepper),
      expiresAt: new Date(now.getTime() + 5 * 60 * 1000),
    },
  });

  try {
    await this.emailService.sendOtp(email, code, purpose);
  } catch {
    // A code that was not delivered must not remain usable.
    await this.prisma.otpChallenge.updateMany({
      where: {
        id: challenge.id,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    throw new HttpException(
      'Unable to send verification code',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
  
async verify(
  userId: string,
  purpose: OtpPurpose,
  code: string,
): Promise<boolean> {
  const pepper = this.config.get<string>('OTP_PEPPER');

  if (!pepper || pepper.length < 32) {
    throw new Error('OTP_PEPPER must be configured securely');
  }

  const now = new Date();

  const challenge = await this.prisma.otpChallenge.findFirst({
    where: {
      userId,
      purpose,
      consumedAt: null,
      expiresAt: { gt: now },
      attempts: { lt: 5 },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!challenge) {
    return false;
  }

  const matches = verifyOtpHash(
    hashOtp(code, pepper),
    challenge.codeHash,
  );

  if (!matches) {
    // Increment only if the challenge is still active and eligible.
    await this.prisma.otpChallenge.updateMany({
      where: {
        id: challenge.id,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: 5 },
      },
      data: {
        attempts: { increment: 1 },
      },
    });

    return false;
  }

  // Only one concurrent request can consume this challenge.
  const consumed = await this.prisma.otpChallenge.updateMany({
    where: {
      id: challenge.id,
      codeHash: challenge.codeHash,
      consumedAt: null,
      expiresAt: { gt: new Date() },
      attempts: { lt: 5 },
    },
    data: {
      consumedAt: new Date(),
      attempts: { increment: 1 },
    },
  });

  return consumed.count === 1;
}

}
