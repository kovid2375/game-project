import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';






export class CreateInterviewResponseDto{
  @ApiProperty({
    example: 'I was at home that night. I did not see the victim after 8 PM.',
    description: 'The answer displayed to the player',
  })
  @IsString()
  @MaxLength(3000)
  responseText: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the suspect appears nervous during this answer',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isNervous?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Display order when a thread has multiple responses',
    minimum: 0,
    maximum: 1000,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  sortOrder?: number;

  @ApiPropertyOptional({
    example: 'The suspect says they were home, but the phone record places them near the office.',
    description: 'Private author notes; never return these to the player.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string;
}