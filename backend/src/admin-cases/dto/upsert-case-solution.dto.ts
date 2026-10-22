
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertCaseSolutionDto {
  @ApiProperty({ description: 'Correct Suspect ID' })
  @IsUUID()
  correctSuspectId: string;

  @ApiProperty({ description: 'Motive' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  motive: string;

  @ApiProperty({ description: 'Method' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  method: string;

  @ApiProperty({ description: 'Explanation' })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  explanation: string;

  @ApiProperty({ description: 'Epilogue' })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  epilogue: string;

  @ApiProperty({ description: 'Motive Keywords' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  motiveKeywords?: string[];

  @ApiProperty({ description: 'Method Keywords' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  methodKeywords?: string[];
}
