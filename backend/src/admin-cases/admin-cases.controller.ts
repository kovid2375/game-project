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
}
