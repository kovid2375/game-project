
import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsUUID,
} from 'class-validator';

export class CreateInterviewResponseUnlockDto {
  @ApiProperty({
    enum: ['CLUE', 'DOCUMENT', 'LOCATION', 'SUSPECT'],
    example: 'CLUE',
    description: 'Type of discovery unlocked by the interview response',
  })
  @IsIn(['CLUE', 'DOCUMENT', 'LOCATION', 'SUSPECT'])
  type: 'CLUE' | 'DOCUMENT' | 'LOCATION' | 'SUSPECT';

  @ApiProperty({
    example: '00000000-0000-4000-8000-000000000001',
    description: 'UUID of the clue, document, location, or suspect to unlock',
  })
  @IsUUID()
  targetId: string;
}
