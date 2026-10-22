    
import { PartialType } from '@nestjs/mapped-types';
import { CreateCaseHintDto } from './create-case-hint.dto.js';

export class UpdateCaseHintDto extends PartialType(
  CreateCaseHintDto,
) {}
