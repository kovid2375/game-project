import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCaseLeadDto {
  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    description: 'The source location ID',
  })
  @IsUUID()
  sourceLocationId: string;

  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    description: 'The destination location ID',
  })
  @IsUUID()
  destinationLocationId: string;

  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    description: 'The required clue ID',
  })
  @IsOptional()
  @IsUUID()
  requiredClueId?: string;

  @ApiProperty({
    example: 'Case Lead Title',
    description: 'The title of the case lead',
  })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiProperty({
    example: 'Case Lead Description',
    description: 'The description of the case lead',
  })
  @IsString()
  description: string;
}