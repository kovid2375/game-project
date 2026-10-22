
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAccusationDto {
  @ApiProperty({
    type: 'string',
    description: 'The ID of the suspect',
  })
  @IsUUID()
  suspectId: string;

  @ApiProperty({
    type: 'string',
    description: 'The motive of the suspect',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  motive: string;

  @ApiProperty({
    type: 'string',
    description: 'The method of the suspect',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  method: string;
  
  @ApiProperty({
    type: 'string',
    description: 'The explanation of the suspect',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  explanation: string;
}
