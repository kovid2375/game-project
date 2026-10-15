
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { EmailService } from './email/email.service.js';
import { OtpService } from './otp/otp.service.js';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_ACCESS_SECRET');

        if (!secret || secret.length < 32) {
          throw new Error(
            'JWT_ACCESS_SECRET must be configured with a strong secret',
          );
        }

        return {
          secret,
          signOptions: { expiresIn: '10m' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService, OtpService],
  exports: [AuthService, PassportModule, JwtStrategy],
})
export class AuthModule {}
