
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ description: 'Name' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  description: string;

  @ApiProperty({ description: 'Image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({ require_tld: false })
  imageUrl?: string;

  @ApiProperty({ description: 'Map X' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  mapX?: number;

  @ApiProperty({ description: 'Map Y' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  mapY?: number;

  @ApiProperty({ description: 'Is Initially Open' })
  @IsOptional()
  @IsBoolean()
  isInitiallyOpen?: boolean;

  @ApiProperty({ description: 'Is Dead End' })
  @IsOptional()
  @IsBoolean()
  isDeadEnd?: boolean;

  @ApiProperty({ description: 'Search Action Point Cost' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  searchActionPointCost?: number;

  @ApiProperty({ description: 'Sort Order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
