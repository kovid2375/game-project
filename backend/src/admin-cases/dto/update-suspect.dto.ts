
import { PartialType } from '@nestjs/swagger';
import { CreateSuspectDto } from './create-suspect.dto.js';

export class UpdateSuspectDto extends PartialType(CreateSuspectDto) {}
