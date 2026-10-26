
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpsertPoliceReportDto {
  @ApiPropertyOptional({
    description: 'Start of the estimated time-of-death interval',
    example: '2026-10-20T20:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  timeOfDeathStart?: string;

  @ApiPropertyOptional({
    description: 'End of the estimated time-of-death interval',
    example: '2026-10-20T23:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  timeOfDeathEnd?: string;

  @ApiProperty({
    description: 'Officially recorded cause of death',
    example: 'Blunt force trauma to the head.',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000)
  causeOfDeath: string;

  @ApiProperty({
    description: 'Investigating officer notes',
    example: 'The scene showed no signs of forced entry.',
    maxLength: 5000,
  })
  @IsString()
  @MaxLength(5000)
  officerNotes: string;

  @ApiPropertyOptional({
    description: 'Whether the police report is published',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
