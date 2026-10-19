import { Module } from '@nestjs/common';
import { GameplayController } from './gameplay.controller.js';
import { GameplayService } from './gameplay.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GameplayController],
  providers: [GameplayService],
})
export class GameplayModule {}