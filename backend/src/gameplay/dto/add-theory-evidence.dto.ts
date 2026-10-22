
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddTheoryEvidenceDto {
  @ApiProperty({
    description: 'The clue id of the theory evidence',
    example: '1',
  })
  @IsUUID()
  clueId: string;
}
