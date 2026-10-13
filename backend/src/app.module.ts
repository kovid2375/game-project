
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule ,ThrottlerGuard} from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
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

