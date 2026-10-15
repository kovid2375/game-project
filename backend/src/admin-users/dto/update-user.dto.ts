import {IsBoolean,IsEmail,IsString,MaxLength,MinLength,IsOptional,} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}