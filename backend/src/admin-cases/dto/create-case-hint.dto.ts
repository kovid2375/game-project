
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCaseHintDto {
  @ApiProperty({ description: 'Hint Number', example: 1 })
  @IsInt()
  @Min(1)
  hintNumber: number;

  @ApiProperty({ description: 'Hint Content', example: 'Hint Content' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @ApiProperty({ description: 'Score Penalty', example: 0 })
  @IsInt()
  @Min(0)
  @Max(100)
  scorePenalty: number = 0;
}
