
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class PasswordResetRequestDto {
  @ApiProperty({ example: 'detective@example.com' })
  @IsEmail()
  @MaxLength(254)
  email: string;
}
