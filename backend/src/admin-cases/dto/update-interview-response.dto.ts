
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

export class UpdateInterviewResponseDto {
  @ApiPropertyOptional({
    description: 'Response given by the suspect',
    example: 'I left the hotel around nine that evening.',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  responseText?: string;

  @ApiPropertyOptional({
    description: 'Whether the suspect appears nervous',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isNervous?: boolean;

  @ApiPropertyOptional({
    description: 'Display order of the response',
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
    description: 'Private notes for case authors; never shown to players',
    example: 'The suspect is concealing the time of the meeting.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string | null;
}
