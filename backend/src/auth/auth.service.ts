import { ConflictException, Injectable ,InternalServerErrorException,UnauthorizedException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { hash, randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import {
  generateRefreshToken,
  hashRefreshToken,
  safeHashEquals,
} from './utils/refresh-token.util.js';
import { OtpPurpose } from '../generated/prisma/client.js';
import { OtpService } from './otp/otp.service.js';
import { BadRequestException } from '@nestjs/common';
import { hashOtp, verifyOtpHash } from './utils/otp.util.js';


@Injectable()
export class AuthService {
    constructor(private readonly prisma:PrismaService,private readonly jwtService:JwtService,private readonly config:ConfigService,private readonly otpService:OtpService){}
    
private async createSession(userId: string) {
  const sessionId = randomUUID();
  const secret = generateRefreshToken();
  const refreshToken = `${sessionId}.${secret}`;

  const ttlDays = Number(
    this.config.get('REFRESH_TOKEN_TTL_DAYS') ?? 7,
  );

  if (!Number.isInteger(ttlDays) || ttlDays < 1 || ttlDays > 30) {
    throw new Error('Invalid refresh-token TTL configuration');
  }

  const expiresAt = new Date(
    Date.now() + ttlDays * 24 * 60 * 60 * 1000,
  );

  await this.prisma.session.create({
    data: {
      id: sessionId,
      userId,
      refreshToken: hashRefreshToken(secret),
      expiresAt,
    },
  });

  return refreshToken;
}

 

    async register(dto:RegisterDto){
        const email=dto.email.trim().toLowerCase();
        const existingUser=await this.prisma.user.findUnique({
            where:{email},
            select:{id:true,}
        })
        if(existingUser){
            throw new ConflictException('An Account with this email is already exits')

        }
        const passwordHash=await argon2.hash(dto.password,{
            type:argon2.argon2id,
        })
        try{
            const user =await this.prisma.user.create({
                data:{
                    name:dto.name,
                    email,
                    passwordHash
                },
                select:{
                    id:true,
                    email:true,
                    name:true,
                    role:true,
                    createdAt:true,
                }
            })
            await this.otpService.issue(
  user.id,
  user.email,
  OtpPurpose.VERIFY_EMAIL,
);
            return {
                message:"Account created successfully,Please check your email for a verification code ",
                user
            }
        }catch (error: unknown) {
      // The unique database constraint also handles concurrent registrations.
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }

      throw new InternalServerErrorException(
        'Unable to create account at this time',
      );
      
    }
  }
  async login(loginDto:LoginDto){
    const email=loginDto.email.trim().toLowerCase()
    const user =await this.prisma.user.findUnique({
        where:{email},
        select:{
            id:true,
            email:true,
            name:true,
            passwordHash:true,
            role:true,
            isActive:true

        }
    })
    if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid email or password');
    } 
    let passwordMatches=false
    try{
        passwordMatches=await argon2.verify(
            user.passwordHash,
            loginDto.password
        )
    }catch{
        throw new UnauthorizedException('Invalid email or password');
    }
    if (!passwordMatches) {
        throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken=await this.jwtService.signAsync({
        sub:user.id,
        role:user.role
    })
    const refreshToken=await this.createSession(user.id)
    return{
        message:'Login Successful',
        accessToken,
        refreshToken,
        tokenType:'Bearer',
        expiresIn: '10m',
        user:{
            id:user.id,
            email:user.email,
            name:user.name,
            role:user.role
        }
    }

  }

  async refresh(refreshToken: string) {
    const [sessionId, secret, extra] = refreshToken.split('.');

    if (!sessionId || !secret || extra !== undefined) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    const suppliedHash = hashRefreshToken(secret);

    if (!safeHashEquals(suppliedHash, session.refreshToken)) {
      // A previous token may have been replayed. Revoke the session.
      await this.prisma.session.updateMany({
        where: { id: session.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!session.user.isActive) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });

      throw new UnauthorizedException('Account is inactive');
    }

    const nextSecret = generateRefreshToken();
    const nextRefreshToken = `${session.id}.${nextSecret}`;
    const now = new Date();

    const ttlDays = Number(
      this.config.get('REFRESH_TOKEN_TTL_DAYS') ?? 7,
    );

    if (!Number.isInteger(ttlDays) || ttlDays < 1 || ttlDays > 30) {
      throw new Error('Invalid refresh-token TTL configuration');
    }

    const updated = await this.prisma.session.updateMany({
      where: {
        id: session.id,
        refreshToken: session.refreshToken,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        refreshToken: hashRefreshToken(nextSecret),
        expiresAt: new Date(
          now.getTime() + ttlDays * 24 * 60 * 60 * 1000,
        ),
        lastUsedAt: now,
      },
    });

    if (updated.count !== 1) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: session.user.id,
      role: session.user.role,
    });

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      expiresIn: 600,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
    };
  }
  async logout(refreshToken?:string){
    if(!refreshToken){
      return {message:'logout successfully'}
    }
    const[sessionId,secret,extra]=refreshToken.split('.')
    if(!sessionId||!secret||extra!==undefined){
      return {message:'logout successfully'}
    }
    const session=await this.prisma.session.findUnique({
      where:{id:sessionId},
      select:{
        id:true,
        refreshToken:true,
        revokedAt:true,
      }
    })
    if(
      session && !session.revokedAt && safeHashEquals(hashRefreshToken(secret),session.refreshToken)
    ){
      await this.prisma.session.updateMany({
        where:{
          id:sessionId,
          revokedAt:null,
          refreshToken:session.refreshToken
        },
        data:{revokedAt:new Date()},
      })
    }
    return{message:'Logged out successfully'}
  }
  async logoutAll(userId:string){
    await this.prisma.session.updateMany({
      where:{
        userId,
        revokedAt:null
      },
      data:{
        revokedAt:new Date()
      }
    })
    return{message:'All sessions logged out successfully'}
  }
  
async requestPasswordReset(emailInput: string) {
  const email = emailInput.trim().toLowerCase();

  const user = await this.prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      isActive: true,
    },
  });

  // Never reveal whether the email exists.
  if (user?.isActive) {
    await this.otpService.issue(
      user.id,
      user.email,
      OtpPurpose.PASSWORD_RESET,
    );
  }

  return {
    message: 'If an eligible account exists, a verification code will be sent.',
  };
}


async confirmPasswordReset(
  emailInput: string,
  code: string,
  newPassword: string,
) {
  const email = emailInput.trim().toLowerCase();
  const pepper = this.config.get<string>('OTP_PEPPER');

  if (!pepper || pepper.length < 32) {
    throw new Error('OTP_PEPPER must be configured securely');
  }

  const user = await this.prisma.user.findUnique({
    where: { email },
    select: { id: true, isActive: true },
  });

  if (!user?.isActive) {
    throw new BadRequestException(
      'Invalid or expired verification code',
    );
  }

  const now = new Date();

  const challenge = await this.prisma.otpChallenge.findFirst({
    where: {
      userId: user.id,
      purpose: OtpPurpose.PASSWORD_RESET,
      consumedAt: null,
      expiresAt: { gt: now },
      attempts: { lt: 5 },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!challenge) {
    throw new BadRequestException(
      'Invalid or expired verification code',
    );
  }

  const suppliedHash = hashOtp(code, pepper);

  if (!verifyOtpHash(suppliedHash, challenge.codeHash)) {
    // Increment attempts only if this challenge is still eligible.
    await this.prisma.otpChallenge.updateMany({
      where: {
        id: challenge.id,
        consumedAt: null,
        attempts: { lt: 5 },
        expiresAt: { gt: now },
      },
      data: { attempts: { increment: 1 } },
    });

    throw new BadRequestException(
      'Invalid or expired verification code',
    );
  }

  const passwordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
  });

  // Atomically consume the OTP, update the password and revoke sessions.
  await this.prisma.$transaction(async (tx) => {
    const consumed = await tx.otpChallenge.updateMany({
      where: {
        id: challenge.id,
        userId: user.id,
        purpose: OtpPurpose.PASSWORD_RESET,
        codeHash: challenge.codeHash,
        consumedAt: null,
        attempts: { lt: 5 },
        expiresAt: { gt: new Date() },
      },
      data: {
        consumedAt: new Date(),
        attempts: { increment: 1 },
      },
    });

    if (consumed.count !== 1) {
      throw new BadRequestException(
        'Invalid or expired verification code',
      );
    }

    await tx.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await tx.session.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  });

  return {
    message: 'Password reset successfully. Please log in again.',
  };
}
async requestOtpLogin(emailInput: string) {
  const email = emailInput.trim().toLowerCase();

  const user = await this.prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      isActive: true,
    },
  });

  // Return the same response whether the account exists or not.
  if (user?.isActive) {
    await this.otpService.issue(
      user.id,
      user.email,
      OtpPurpose.LOGIN,
    );
  }

  return {
    message:
      'If an eligible account exists, a verification code will be sent.',
  };
}
async verifyOtpLogin(emailInput: string, code: string) {
  const email = emailInput.trim().toLowerCase();

  const user = await this.prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user?.isActive) {
    throw new UnauthorizedException('Invalid or expired code');
  }

  const verified = await this.otpService.verify(
    user.id,
    OtpPurpose.LOGIN,
    code,
  );

  if (!verified) {
    throw new UnauthorizedException('Invalid or expired code');
  }

  const accessToken = await this.jwtService.signAsync({
    sub: user.id,
    role: user.role,
  });

  // Reuse your existing helper that stores a hashed refresh token.
  const refreshToken = await this.createSession(user.id);

  return {
    message: 'Login successful',
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: 600,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
async verifyEmail(emailInput: string, code: string) {
  const email = emailInput.trim().toLowerCase();

  const user = await this.prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      emailVerifiedAt: true,
      isActive: true,
    },
  });

  if (!user?.isActive) {
    throw new UnauthorizedException('Invalid or expired code');
  }

  if (user.emailVerifiedAt) {
    return { message: 'Email is already verified' };
  }

  const verified = await this.otpService.verify(
    user.id,
    OtpPurpose.VERIFY_EMAIL,
    code,
  );

  if (!verified) {
    throw new UnauthorizedException('Invalid or expired code');
  }

  await this.prisma.user.update({
    where: { id: user.id },
    data: { emailVerifiedAt: new Date() },
  });

  return { message: 'Email verified successfully' };
}




}

