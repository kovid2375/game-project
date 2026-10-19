import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../auth/auth.module.js';
import { AdminCasesController } from './admin-cases.controller.js';
import { ImageKitService } from './imagekit.service.js';
import { CloudinaryService } from './cloudinary.service.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { AdminCasesService } from './admin-cases.service.js';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [AdminCasesController],
  providers: [CloudinaryService, ImageKitService, AdminCasesService, RolesGuard],
})
export class AdminCasesModule {}