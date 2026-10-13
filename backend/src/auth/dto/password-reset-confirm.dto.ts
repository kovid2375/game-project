
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class PasswordResetConfirmDto {
  @ApiProperty({ example: 'detective@example.com' })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: '012345', description: 'Six-digit code sent by email' })
  @Matches(/^\d{6}$/)
  code: string;

  @ApiProperty({
    example: 'A-Strong-New-Password-2026!',
    minLength: 12,
    maxLength: 128,
    format: 'password',
  })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/[a-z]/)
  @Matches(/[A-Z]/)
  @Matches(/[0-9]/)
  newPassword: string;
}
