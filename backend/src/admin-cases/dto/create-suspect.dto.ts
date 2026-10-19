
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSuspectDto {
  @ApiProperty({ example: 'Daniel Carter', maxLength: 120 })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({
    example: 'https://example.com/suspect.jpg',
    maxLength: 2048,
  })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  photoUrl?: string;

  @ApiProperty({ example: 'Business partner of the victim' })
  @IsString()
  @MaxLength(500)
  relationship: string;

  @ApiProperty({ example: 'A reserved businessperson with access to the office.' })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 'Claims to have been at home between 9 PM and 11 PM.' })
  @IsString()
  @MaxLength(1000)
  claimedAlibi: string;

  @ApiPropertyOptional({
    example: 'Had a financial dispute with the victim.',
    description: 'Connections or background information visible in the dossier.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  connections?: string;

  @ApiPropertyOptional({ example: 1, minimum: 0, maximum: 1000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  sortOrder?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether the suspect is available from the start of the case.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isInitiallyUnlocked?: boolean;
}
