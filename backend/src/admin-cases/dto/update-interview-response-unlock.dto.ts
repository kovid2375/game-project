
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateInterviewResponseUnlockDto {
  @ApiPropertyOptional({
    description: 'Clue ID to unlock; set to null to clear it',
    format: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  clueId?: string | null;

  @ApiPropertyOptional({
    description: 'Document ID to unlock; set to null to clear it',
    format: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  documentId?: string | null;

  @ApiPropertyOptional({
    description: 'Location ID to unlock; set to null to clear it',
    format: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  locationId?: string | null;

  @ApiPropertyOptional({
    description: 'Suspect ID to unlock; set to null to clear it',
    format: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  suspectId?: string | null;
}
