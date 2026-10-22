
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({
    example: "Title",
    description: "Title of the document",
    maxLength: 160,
    type: String,
  })
  @IsString()
  @MaxLength(160)
  title: string;

  @ApiProperty({
    example: "Description",
    description: "Description of the document",
    maxLength: 2000,
    type: String,
  })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({
    example: "Content",
    description: "Content of the document",
    maxLength: 10000,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  content?: string;

  @ApiProperty({
    example: "Url of the document",
    description: "Url of the document",
    maxLength: 2048,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({ require_tld: false })
  fileUrl?: string;

  @ApiProperty({
    example: "0",
    description: "Sort order of the document",
    minimum: 0,
    maximum: 10000,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder?: number;
}
