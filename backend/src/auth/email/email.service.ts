import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { OtpPurpose } from '../../generated/prisma/client.js';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host || !user || !pass || !Number.isInteger(port)) {
      throw new Error('SMTP configuration is incomplete');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendOtp(
    email: string,
    code: string,
    purpose: OtpPurpose | 'LOGIN' | 'PASSWORD_RESET' | 'VERIFY_EMAIL',
  ) {
    const from = this.config.get<string>('SMTP_FROM');

    if (!from) {
      throw new Error('SMTP_FROM is not configured');
    }

    const subject =
      purpose === 'LOGIN'
        ? 'Your CASEFILE login code'
        : purpose === 'PASSWORD_RESET'
        ? 'Reset your CASEFILE password'
        : 'Verify your CASEFILE email';

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject,
        text: `Your CASEFILE verification code is ${code}. It expires in 5 minutes. If you did not request this, you can ignore this email.`,
      });
    } catch {
      throw new InternalServerErrorException(
        'Unable to send verification email',
      );
    }
  }
}
