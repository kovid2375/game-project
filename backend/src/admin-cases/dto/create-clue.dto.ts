
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateClueDto {
  @ApiProperty({
    example: "Title",
    description: "Title of the clue",
    minLength: 1,
    maxLength: 160,
    type: String,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title: string;

  @ApiProperty({
    example: "Description",
    description: "Description of the clue",
    minLength: 1,
    maxLength: 3000,
    type: String,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  description: string;

  @ApiProperty({
    example: "https://example.com/image.jpg",
    description: "Image URL of the clue",
    maxLength: 2048,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @ApiProperty({
    example: ["tag1", "tag2"],
    description: "Tags of the clue",
    maxLength: 30,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @ApiProperty({
    example: true,
    description: "Is this clue required to complete the case?",
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({
    example: 1,
    description: "Sort order of the clue",
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder?: number;
}
