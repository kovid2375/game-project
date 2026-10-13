
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  Req,
  UseGuards,
  Res,
  UnauthorizedException
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

import type { Response, Request } from 'express';
import { max } from 'class-validator';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto.js';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto.js';
import { OtpLoginRequestDto } from './dto/otp-login-request.dto.js';
import { OtpLoginVerifyDto } from './dto/otp-login-verify.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';

interface AuthenticatedRequest extends Request{
    user:{
        id:string;
        name:string;
        email:string;
        role:'PLAYER'| 'ADMIN'
    }
}




@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private setRefreshCookie(res:Response,token:string){
    res.cookie('casefile_refresh',token,{
    httpOnly:true,
    secure:process.env.COOKIE_SECURE==='true',
    sameSite:'strict',
    maxAge:7*24*60*60*1000,
    })
    
  }
  private clearRefreshCookie(res:Response){
    res.clearCookie('casefile_refresh',{
        httpOnly:true,
        secure:process.env.COOKIE_SECURE==='true',
        sameSite:'strict',
        path:'/api/auth'
    })
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new CASEFILE account' })
  @ApiCreatedResponse({ description: 'Account created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid registration data' })
  @ApiConflictResponse({ description: 'Email already registered' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:'Log in to the CASEFILE'})
  @ApiUnauthorizedResponse({description:'Invalid credentials'})
  async login(@Body() loginDto:LoginDto,@Res({passthrough:true}) res:Response){
    const result =await this.authService.login(loginDto)
    this.setRefreshCookie(res,result.refreshToken)
    const{refreshToken,...safeResult}=result
    return safeResult
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:'Refresh the access token'})
  @ApiUnauthorizedResponse({description:'Invalid or expired refresh token'})
  async refresh(@Req() req:Request,@Res({passthrough:true}) res:Response){
    const token=req.cookies?.casefile_refresh
    if(typeof token!='string'){
        throw new UnauthorizedException('Refresh Session required')
    }
    const result =await this.authService.refresh(token)
    this.setRefreshCookie(res,result.refreshToken)
    const {refreshToken,...safeResult}=result
    return safeResult
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({summary:'Get the current Authenticated User'})
  me(@Req() req:AuthenticatedRequest){
    return req.user
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:'Log out the current refresh session'})
  async logout(@Req() req:Request,@Res({"passthrough":true}) res:Response){
    const token =req.cookies?.casefile_refresh;
    await this.authService.logout(
        typeof token==='string'?token:undefined,
    )
    this.clearRefreshCookie(res)
    return {message:'logged out successfully'}
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:'log out all sessions for the current user'})
  async logoutAll(@Req() req:AuthenticatedRequest){
    return this.authService.logoutAll(req.user.id)
  }

  
@Post('password-reset/request')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Request a password-reset code' })
requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
  return this.authService.requestPasswordReset(dto.email);
}


@Post('password-reset/confirm')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Verify OTP and reset the password' })
async confirmPasswordReset(
  @Body() dto: PasswordResetConfirmDto,
) {
  return this.authService.confirmPasswordReset(
    dto.email,
    dto.code,
    dto.newPassword,
  );
}
@Post('otp-login/request')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Request a passwordless login code' })
requestOtpLogin(@Body() dto: OtpLoginRequestDto) {
  return this.authService.requestOtpLogin(dto.email);
}

@Post('otp-login/verify')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Verify OTP and log in' })
async verifyOtpLogin(
  @Body() dto: OtpLoginVerifyDto,
  @Res({ passthrough: true }) res: Response,
) {
  const result = await this.authService.verifyOtpLogin(
    dto.email,
    dto.code,
  );

  this.setRefreshCookie(res, result.refreshToken);

  const { refreshToken, ...safeResult } = result;
  return safeResult;
}
@Post('verify-email')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Verify a CASEFILE email address' })
verifyEmail(@Body() dto: VerifyEmailDto) {
  return this.authService.verifyEmail(dto.email, dto.code);
}


  
}
