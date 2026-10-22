
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTheoryDraftDto {
  @ApiProperty({
    description: 'The suspect id of the theory draft',
    example: '1',
  })
  @IsOptional()
  @IsUUID()
  suspectId?: string;

  @ApiProperty({
    description: 'The motive of the theory draft',
    example: '1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motive?: string;

  @ApiProperty({
    description: 'The method of the theory draft',
    example: '1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  method?: string;

  @ApiProperty({
    description: 'The explanation of the theory draft',
    example: '1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  explanation?: string;
}
