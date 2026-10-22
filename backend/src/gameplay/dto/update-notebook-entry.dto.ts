
import { PartialType } from '@nestjs/mapped-types';
import { CreateNotebookEntryDto } from './create-notebook-entry.dto.js';

export class UpdateNotebookEntryDto extends PartialType(
  CreateNotebookEntryDto,
) {}

