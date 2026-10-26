
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateInterviewThreadDto {
  @ApiPropertyOptional({
    description: 'Interview topic',
    example: 'Relationship with the victim',
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  topic?: string;

  @ApiPropertyOptional({
    description: 'Question asked during interrogation',
    example: 'When did you last see the victim?',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  question?: string;

  @ApiPropertyOptional({
    description: 'Display order of the question',
    example: 1,
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Interview visit number when this question becomes available',
    example: 1,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  visitNumber?: number;

  @ApiPropertyOptional({
    description: 'Whether the question is available at the start',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isInitiallyAvailable?: boolean;
}
