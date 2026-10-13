
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches, MaxLength } from 'class-validator';

export class OtpLoginVerifyDto {
  @ApiProperty({ example: 'detective@example.com' })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Six-digit code sent to your email',
  })
  @Matches(/^\d{6}$/)
  code: string;
}
