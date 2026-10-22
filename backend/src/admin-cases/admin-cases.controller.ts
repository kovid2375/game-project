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








}
