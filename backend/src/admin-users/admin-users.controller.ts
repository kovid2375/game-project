import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { AdminUsersService } from './admin-users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { FindUsersQueryDto } from './dto/find-users-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { SkipThrottle } from '@nestjs/throttler';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    role: string;
  };
};

@ApiTags('Admin Users')
@ApiBearerAuth()
@SkipThrottle()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminUsersController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List players with optional search, status, and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of players' })
  findAll(@Query() query: FindUsersQueryDto) {
    const status =
      query.status && query.status !== 'all' ? query.status : undefined;

    return this.adminUsersService.findAll(
      query.page ?? 1,
      query.limit ?? 20,
      query.search,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed information for a single player' })
  @ApiResponse({ status: 200, description: 'Player details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a player account' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.adminUsersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a player account' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminUsersService.remove(id, req.user.id);
  }
}