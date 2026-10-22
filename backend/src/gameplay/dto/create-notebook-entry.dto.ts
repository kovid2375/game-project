
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotebookEntryDto {
  @ApiProperty({
    description: 'The title of the notebook entry',
    example: 'My Notebook Entry',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title: string;

  @ApiProperty({
    description: 'The content of the notebook entry',
    example: 'My Notebook Entry',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @ApiProperty({
    description: 'The tags of the notebook entry',
    example: ['tag1', 'tag2'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];
}
