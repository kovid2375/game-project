import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service.js';
import { LoginDto } from '../auth/dto/login.dto.js';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.adminLogin(dto);

    const ttlDays = Number(
      this.config.get('REFRESH_TOKEN_TTL_DAYS') ?? 7,
    );

    res.cookie('casefile_refresh', result.refreshToken, {
      httpOnly: true,
      secure: this.config.get('COOKIE_SECURE') === 'true',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: ttlDays * 24 * 60 * 60 * 1000,
    });

    const { refreshToken, ...response } = result;

    return response;
  }
}