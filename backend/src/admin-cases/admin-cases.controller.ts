import {
  Controller,
  UseGuards,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpStatus,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  Query,
  ParseUUIDPipe,
  BadRequestException,
  Get,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ImageKitService } from './imagekit.service.js';
import { CloudinaryService } from './cloudinary.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { Body } from '@nestjs/common';
import { CreateCaseDto } from './dto/create-case.dto.js';
import { AdminCasesService } from './admin-cases.service.js';
import { UpdateCaseDto } from './dto/update-case.dto.js';
import { FindCasesQueryDto } from './dto/find-cases-query.dto.js';
import { CreateSuspectDto } from './dto/create-suspect.dto.js';
import { UpdateSuspectDto } from './dto/update-suspect.dto.js';
import { CreateInterviewThreadDto } from './dto/create-interview-thread.dto.js';
import { CreateInterviewResponseDto } from './dto/create-interview-response.dto.js';
import { CreateInterviewResponseUnlockDto } from './dto/create-interview-response-unlock.dto.js';
import { CreateCaseLeadDto } from './dto/create-case-lead.dto.js';
import { CreateCaseHintDto } from './dto/create-case-hint.dto.js';
import { UpdateCaseHintDto } from './dto/update-case-hint.dto.js';
import { UpsertCaseSolutionDto } from './dto/upsert-case-solution.dto.js';
import { CreateLocationDto } from './dto/create-location.dto.js';
import { UpdateLocationDto } from './dto/update-location.dto.js';
import { CreateClueDto } from './dto/create-clue.dto.js';
import { UpdateClueDto } from './dto/update-clue.dto.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { UpsertCaseVictimDto } from './dto/upsert-case-victim.dto.js';
import { UpsertPoliceReportDto } from './dto/upsert-police-report.dto.js';
import { UpdateInterviewThreadDto } from './dto/update-interview-thread.dto.js';
import { UpdateInterviewResponseDto } from './dto/update-interview-response.dto.js';
import { UpdateInterviewResponseUnlockDto } from './dto/update-interview-response-unlock.dto.js';
@ApiTags('Admin Cases')
@ApiBearerAuth()
@Controller('admin/cases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminCasesController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly adminCasesService: AdminCasesService,
  ) {}

  @Post('upload-case-cover')
  @ApiOperation({ summary: 'Upload cover image for a case' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, png, webp, max 5MB)',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file size exceeded',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Requires ADMIN role)' })
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    }),
  )
  async uploadCover(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),
        )
        .addValidator(
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
          }),
        )
        .build({
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.cloudinaryService.uploadCaseCover(file);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new case' })
  @ApiResponse({ status: 201, description: 'Case created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Requires ADMIN role)' })
  async createCase(@Body() dto: CreateCaseDto) {
    return this.adminCasesService.create(dto);
  }
  @Get()
  @ApiOperation({
    summary: 'Get all cases with pagination and optional search',
  })
  @ApiResponse({ status: 200, description: 'List of cases' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Requires ADMIN role)' })
  findAll(@Query() query: FindCasesQueryDto) {
    return this.adminCasesService.findAll(
      query.page,
      query.limit,
      query.search,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a case' })
  @ApiResponse({ status: 200, description: 'Case updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Requires ADMIN role)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCaseDto) {
    return this.adminCasesService.update(id, dto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Set published status of a case' })
  @ApiResponse({ status: 200, description: 'Case published successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Requires ADMIN role)' })
  setPublished(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isPublished') isPublished: boolean,
  ) {
    if (typeof isPublished !== 'boolean') {
      throw new BadRequestException('isPublished must be a boolean');
    }

    return this.adminCasesService.setPublished(id, isPublished);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a case' })
  @ApiResponse({ status: 200, description: 'Case deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Requires ADMIN role)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminCasesService.remove(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a case by ID' })
  @ApiResponse({ status: 200, description: 'Case details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Requires ADMIN role)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminCasesService.findOne(id);
  }

  
@Post(':caseId/suspects')
@ApiOperation({ summary: 'Create a suspect for a case' })
@ApiResponse({ status: 201, description: 'Suspect created successfully' })
@ApiResponse({ status: 400, description: 'Invalid request data' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Admin access required' })
@ApiResponse({ status: 404, description: 'Case not found' })
async createSuspect(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Body() dto: CreateSuspectDto,
) {
  return this.adminCasesService.createSuspect(caseId, dto);
}

@Get(':caseId/suspects')
@ApiOperation({ summary: 'Get all suspects for a case' })
@ApiResponse({ status: 200, description: 'Suspects retrieved successfully' })
async getSuspects(
  @Param('caseId', ParseUUIDPipe) caseId: string,
) {
  return this.adminCasesService.getSuspects(caseId);
}


@Patch('suspects/:suspectId')
@ApiOperation({ summary: 'Update suspect details' })
@ApiResponse({ status: 200, description: 'Suspect updated successfully' })
@ApiResponse({ status: 400, description: 'Invalid request' })
@ApiResponse({ status: 404, description: 'Suspect not found' })
async updateSuspect(
  @Param('suspectId', ParseUUIDPipe) suspectId: string,
  @Body() dto: UpdateSuspectDto,
) {
  return this.adminCasesService.updateSuspect(suspectId, dto);
}


@Delete('suspects/:suspectId')
@ApiOperation({ summary: 'Delete a suspect if unused' })
@ApiResponse({ status: 200, description: 'Suspect deleted successfully' })
@ApiResponse({ status: 400, description: 'Suspect is already in use' })
@ApiResponse({ status: 404, description: 'Suspect not found' })
async deleteSuspect(
  @Param('suspectId', ParseUUIDPipe) suspectId: string,
) {
  return this.adminCasesService.deleteSuspect(suspectId);
}

@Post('suspects/:suspectId/interview-threads')
@ApiOperation({summary:'Create an interview question for a suspect'})
@ApiResponse({
  status:201,
  description:'Interview question created successfully',
})
@ApiResponse({status:400,description:'Invalid request data'})
@ApiResponse({status:401,description:'Unauthorized'})
@ApiResponse({status:403,description:'Admin access required'})
@ApiResponse({status:404,description:'Suspect not found'})
async createInterviewThread(
  @Param('suspectId',ParseUUIDPipe) suspectId:string,
  @Body() dto:CreateInterviewThreadDto,
){
  return this.adminCasesService.createInterviewThread(suspectId,dto)
}


@Post('interview-threads/:threadId/responses')
@ApiOperation({ summary: 'Create a suspect response for an interview question' })
@ApiResponse({ status: 201, description: 'Interview response created successfully' })
@ApiResponse({ status: 404, description: 'Interview thread not found' })
async createInterviewResponse(
  @Param('threadId', ParseUUIDPipe) threadId: string,
  @Body() dto: CreateInterviewResponseDto,
) {
  return this.adminCasesService.createInterviewResponse(threadId, dto);
}



@Get('suspects/:suspectId/interview-threads')
@ApiOperation({ summary: 'List interview threads and responses for a suspect' })
@ApiResponse({ status: 200, description: 'Interview threads retrieved successfully' })
@ApiResponse({ status: 404, description: 'Suspect not found' })
async getInterviewThreads(
  @Param('suspectId', ParseUUIDPipe) suspectId: string,
) {
  return this.adminCasesService.getInterviewThreads(suspectId);
}

@Post('interview-responses/:responseId/unlocks')
@ApiOperation({
  summary: 'Configure a clue, document, location, or suspect unlocked by a response',
})
@ApiResponse({ status: 201, description: 'Discovery configured successfully' })
@ApiResponse({ status: 400, description: 'Invalid target or duplicate unlock' })
@ApiResponse({ status: 404, description: 'Interview response not found' })
async createInterviewResponseUnlock(
  @Param('responseId', ParseUUIDPipe) responseId: string,
  @Body() dto: CreateInterviewResponseUnlockDto,
) {
  return this.adminCasesService.createInterviewResponseUnlock(
    responseId,
    dto,
  );
}



@Post(':caseId/leads')
@ApiOperation({ summary: 'Create a lead connecting two case locations' })
@ApiResponse({ status: 201, description: 'Lead created successfully' })
async createLead(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Body() dto: CreateCaseLeadDto,
) {
  return this.adminCasesService.createLead(caseId, dto);
}


@Get(':caseId/leads')
@ApiOperation({ summary: 'Get all leads for a case' })
@ApiResponse({ status: 200, description: 'Case leads retrieved successfully' })
getLeads(
  @Param('caseId', ParseUUIDPipe) caseId: string,
) {
  return this.adminCasesService.getLeads(caseId);
}


@Delete(':caseId/leads/:leadId')
@ApiOperation({ summary: 'Delete a lead from a case' })
@ApiResponse({ status: 200, description: 'Lead deleted successfully' })
deleteLead(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Param('leadId', ParseUUIDPipe) leadId: string,
) {
  return this.adminCasesService.deleteLead(caseId, leadId);
}


@Post(':caseId/hints')
@ApiOperation({ summary: 'Create a hint for a case' })
@ApiResponse({ status: 201, description: 'Hint created successfully' })
@ApiResponse({ status: 400, description: 'Invalid request data' })
@ApiResponse({ status: 404, description: 'Case not found' })
createCaseHint(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Body() dto: CreateCaseHintDto,
) {
  return this.adminCasesService.createCaseHint(caseId, dto);
}

@Get(':caseId/hints')
@ApiOperation({ summary: 'Get all hints for a case' })
@ApiResponse({ status: 200, description: 'Case hints retrieved successfully' })
@ApiResponse({ status: 404, description: 'Case not found' })
getCaseHints(
  @Param('caseId', ParseUUIDPipe) caseId: string,
) {
  return this.adminCasesService.getCaseHints(caseId);
}

@Patch(':caseId/hints/:hintId')
@ApiOperation({ summary: 'Update a hint for a case' })
@ApiResponse({ status: 200, description: 'Hint updated successfully' })
@ApiResponse({ status: 400, description: 'Invalid request data' })
@ApiResponse({ status: 404, description: 'Hint not found' })
updateCaseHint(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Param('hintId', ParseUUIDPipe) hintId: string,
  @Body() dto: UpdateCaseHintDto,
) {
  return this.adminCasesService.updateCaseHint(caseId, hintId, dto);
}

@Delete(':caseId/hints/:hintId')
@ApiOperation({ summary: 'Delete a hint from a case' })
@ApiResponse({ status: 200, description: 'Hint deleted successfully' })
@ApiResponse({ status: 404, description: 'Hint not found' })
deleteCaseHint(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Param('hintId', ParseUUIDPipe) hintId: string,
) {
  return this.adminCasesService.deleteCaseHint(caseId, hintId);
}



@Put(':caseId/solution')
upsertCaseSolution(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Body() dto: UpsertCaseSolutionDto,
) {
  return this.adminCasesService.upsertCaseSolution(caseId, dto);
}


@Post(':caseId/locations')
createLocation(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Body() dto: CreateLocationDto,
) {
  return this.adminCasesService.createLocation(caseId, dto);
}

@Get(':caseId/locations')
getLocations(
  @Param('caseId', ParseUUIDPipe) caseId: string,
) {
  return this.adminCasesService.getLocations(caseId);
}

@Patch(':caseId/locations/:locationId')
updateLocation(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Param('locationId', ParseUUIDPipe) locationId: string,
  @Body() dto: UpdateLocationDto,
) {
  return this.adminCasesService.updateLocation(
    caseId,
    locationId,
    dto,
  );
}

@Delete(':caseId/locations/:locationId')
deleteLocation(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Param('locationId', ParseUUIDPipe) locationId: string,
) {
  return this.adminCasesService.deleteLocation(caseId, locationId);
}

@Post(':caseId/locations/:locationId/clues')
createClue(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Param('locationId', ParseUUIDPipe) locationId: string,
  @Body() dto: CreateClueDto,
) {
  return this.adminCasesService.createClue(
    caseId,
    locationId,
    dto,
  );
}

@Get(':caseId/locations/:locationId/clues')
getClues(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Param('locationId', ParseUUIDPipe) locationId: string,
) {
  return this.adminCasesService.getClues(caseId, locationId);
}

@Patch(':caseId/locations/:locationId/clues/:clueId')
updateClue(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Param('locationId', ParseUUIDPipe) locationId: string,
  @Param('clueId', ParseUUIDPipe) clueId: string,
  @Body() dto: UpdateClueDto,
) {
  return this.adminCasesService.updateClue(
    caseId,
    locationId,
    clueId,
    dto,
  );
}

@Delete(':caseId/locations/:locationId/clues/:clueId')
deleteClue(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Param('locationId', ParseUUIDPipe) locationId: string,
  @Param('clueId', ParseUUIDPipe) clueId: string,
) {
  return this.adminCasesService.deleteClue(
    caseId,
    locationId,
    clueId,
  );
}

@Post(':caseId/locations/:locationId/documents')
createDocument(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Param('locationId', ParseUUIDPipe) locationId: string,
  @Body() dto: CreateDocumentDto,
) {
  return this.adminCasesService.createDocument(
    caseId,
    locationId,
    dto,
  );
}

@Get(':caseId/locations/:locationId/documents')
getDocuments(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Param('locationId', ParseUUIDPipe) locationId: string,
) {
  return this.adminCasesService.getDocuments(caseId, locationId);
}

@Patch(':caseId/locations/:locationId/documents/:documentId')
updateDocument(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Param('locationId', ParseUUIDPipe) locationId: string,
  @Param('documentId', ParseUUIDPipe) documentId: string,
  @Body() dto: UpdateDocumentDto,
) {
  return this.adminCasesService.updateDocument(
    caseId,
    locationId,
    documentId,
    dto,
  );
}

@Delete(':caseId/locations/:locationId/documents/:documentId')
deleteDocument(
  @Param('caseId', ParseUUIDPipe) caseId: string,
  @Param('locationId', ParseUUIDPipe) locationId: string,
  @Param('documentId', ParseUUIDPipe) documentId: string,
) {
  return this.adminCasesService.deleteDocument(
    caseId,
    locationId,
    documentId,
  );
}


  @Get(':caseId/victim')
  @ApiOperation({
    summary: 'Get case victim',
    description: 'Retrieve the victim details associated with a case.',
  })
  @ApiResponse({ status: 200, description: 'Victim retrieved successfully or null if not configured.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid JWT.' })
  @ApiResponse({ status: 403, description: 'Forbidden: ADMIN role required.' })
  @ApiResponse({ status: 404, description: 'Case not found.' })
  getCaseVictim(
    @Param('caseId', ParseUUIDPipe) caseId: string,
  ) {
    return this.adminCasesService.getCaseVictim(caseId);
  }

  @Put(':caseId/victim')
  @ApiOperation({
    summary: 'Create or update case victim',
    description: 'Creates the victim record if absent; otherwise updates it.',
  })
  @ApiResponse({ status: 200, description: 'Victim created or updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid victim data or case ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid JWT.' })
  @ApiResponse({ status: 403, description: 'Forbidden: ADMIN role required.' })
  @ApiResponse({ status: 404, description: 'Case not found.' })
  upsertCaseVictim(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() dto: UpsertCaseVictimDto,
  ) {
    return this.adminCasesService.upsertCaseVictim(caseId, dto);
  }

  @Delete(':caseId/victim')
  @ApiOperation({
    summary: 'Delete case victim',
    description: 'Deletes the victim record associated with a case.',
  })
  @ApiResponse({ status: 200, description: 'Victim deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid JWT.' })
  @ApiResponse({ status: 403, description: 'Forbidden: ADMIN role required.' })
  @ApiResponse({ status: 404, description: 'Victim record not found.' })
  deleteCaseVictim(
    @Param('caseId', ParseUUIDPipe) caseId: string,
  ) {
    return this.adminCasesService.deleteCaseVictim(caseId);
  }

  @Get(':caseId/police-report')
  @ApiOperation({
    summary: 'Get police report',
    description: 'Retrieve the police report associated with a case.',
  })
  @ApiResponse({ status: 200, description: 'Police report retrieved successfully or null if not configured.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid JWT.' })
  @ApiResponse({ status: 403, description: 'Forbidden: ADMIN role required.' })
  @ApiResponse({ status: 404, description: 'Case not found.' })
  getPoliceReport(
    @Param('caseId', ParseUUIDPipe) caseId: string,
  ) {
    return this.adminCasesService.getPoliceReport(caseId);
  }

  @Put(':caseId/police-report')
  @ApiOperation({
    summary: 'Create or update police report',
    description: 'Creates the police report if absent; otherwise updates it.',
  })
  @ApiResponse({ status: 200, description: 'Police report created or updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid report data or time-of-death interval.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid JWT.' })
  @ApiResponse({ status: 403, description: 'Forbidden: ADMIN role required.' })
  @ApiResponse({ status: 404, description: 'Case not found.' })
  upsertPoliceReport(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() dto: UpsertPoliceReportDto,
  ) {
    return this.adminCasesService.upsertPoliceReport(caseId, dto);
  }

  @Delete(':caseId/police-report')
  @ApiOperation({
    summary: 'Delete police report',
    description: 'Deletes the police report associated with a case.',
  })
  @ApiResponse({ status: 200, description: 'Police report deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: missing or invalid JWT.' })
  @ApiResponse({ status: 403, description: 'Forbidden: ADMIN role required.' })
  @ApiResponse({ status: 404, description: 'Police report not found.' })
  deletePoliceReport(
    @Param('caseId', ParseUUIDPipe) caseId: string,
  ) {
    return this.adminCasesService.deletePoliceReport(caseId);
  }

  
@Get(':caseId/validate')
@ApiOperation({
  summary: 'Validate case content before publishing',
})
@ApiResponse({
  status: 200,
  description: 'Returns validation errors and warnings.',
})
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Admin access required.' })
@ApiResponse({ status: 404, description: 'Case not found.' })
validateCaseForPublishing(
  @Param('caseId', ParseUUIDPipe) caseId: string,
) {
  return this.adminCasesService.validateCaseForPublishing(caseId);
}

@Patch('interview-threads/:threadId')
@ApiOperation({ summary: 'Update an interview thread' })
@ApiResponse({ status: 200, description: 'Interview thread updated' })
@ApiResponse({ status: 404, description: 'Interview thread not found' })
updateInterviewThread(
  @Param('threadId', ParseUUIDPipe) threadId: string,
  @Body() dto: UpdateInterviewThreadDto,
) {
  return this.adminCasesService.updateInterviewThread(threadId, dto);
}

@Delete('interview-threads/:threadId')
@ApiOperation({ summary: 'Delete an interview thread' })
@ApiResponse({ status: 200, description: 'Interview thread deleted' })
@ApiResponse({ status: 409, description: 'Thread has dependent data' })
deleteInterviewThread(
  @Param('threadId', ParseUUIDPipe) threadId: string,
) {
  return this.adminCasesService.deleteInterviewThread(threadId);
}

@Patch('interview-responses/:responseId')
@ApiOperation({ summary: 'Update an interview response' })
@ApiResponse({ status: 200, description: 'Interview response updated' })
@ApiResponse({ status: 404, description: 'Interview response not found' })
updateInterviewResponse(
  @Param('responseId', ParseUUIDPipe) responseId: string,
  @Body() dto: UpdateInterviewResponseDto,
) {
  return this.adminCasesService.updateInterviewResponse(responseId, dto);
}

@Delete('interview-responses/:responseId')
@ApiOperation({ summary: 'Delete an interview response' })
@ApiResponse({ status: 200, description: 'Interview response deleted' })
@ApiResponse({ status: 409, description: 'Response has dependent data' })
deleteInterviewResponse(
  @Param('responseId', ParseUUIDPipe) responseId: string,
) {
  return this.adminCasesService.deleteInterviewResponse(responseId);
}


@Get('interview-responses/:responseId/unlocks')
@ApiOperation({ summary: 'Get unlock rules for an interview response' })
@ApiResponse({ status: 200, description: 'Unlock rules retrieved' })
@ApiResponse({ status: 404, description: 'Interview response not found' })
getInterviewResponseUnlocks(
  @Param('responseId', ParseUUIDPipe) responseId: string,
) {
  return this.adminCasesService.getInterviewResponseUnlocks(responseId);
}

@Patch('interview-response-unlocks/:unlockId')
@ApiOperation({ summary: 'Update an interview response unlock rule' })
@ApiResponse({ status: 200, description: 'Unlock rule updated' })
@ApiResponse({ status: 400, description: 'Invalid target or case mismatch' })
@ApiResponse({ status: 404, description: 'Unlock rule not found' })
updateInterviewResponseUnlock(
  @Param('unlockId', ParseUUIDPipe) unlockId: string,
  @Body() dto: UpdateInterviewResponseUnlockDto,
) {
  return this.adminCasesService.updateInterviewResponseUnlock(unlockId, dto);
}

@Delete('interview-response-unlocks/:unlockId')
@ApiOperation({ summary: 'Delete an interview response unlock rule' })
@ApiResponse({ status: 200, description: 'Unlock rule deleted' })
@ApiResponse({ status: 404, description: 'Unlock rule not found' })
deleteInterviewResponseUnlock(
  @Param('unlockId', ParseUUIDPipe) unlockId: string,
) {
  return this.adminCasesService.deleteInterviewResponseUnlock(unlockId);
}




@Get(':caseId/preview')
@ApiOperation({ summary: 'Preview complete case authoring content' })
@ApiResponse({
  status: 200,
  description: 'Complete case content retrieved',
})
@ApiResponse({
  status: 404,
  description: 'Case not found',
})
getCasePreview(
  @Param('caseId', ParseUUIDPipe) caseId: string,
) {
  return this.adminCasesService.getCasePreview(caseId);
}









}
