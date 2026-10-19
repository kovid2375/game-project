
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule ,ThrottlerGuard} from '@nestjs/throttler';
import { AdminAuthModule } from './admin-auth/admin-auth.module.js';
import { AdminUsersModule } from './admin-users/admin-users.module.js';
import { AdminCasesModule } from './admin-cases/admin-cases.module.js';
import { GameplayModule } from './gameplay/gameplay.module.js';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AdminAuthModule,
    AdminUsersModule,
    AdminCasesModule,
    GameplayModule,
    ThrottlerModule.forRoot([{
      ttl:60_000,
      limit:10,
    }])
  ],
  providers:[
    {
      provide:APP_GUARD,
      useClass:ThrottlerGuard
    }
  ]
})
export class AppModule {}

