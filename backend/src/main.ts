import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import{DocumentBuilder,SwaggerModule} from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const swaggerConfig = new DocumentBuilder()
    .setTitle('CASEFILE API')
    .setDescription(
      'API documentation for CASEFILE detective mystery game',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'Account registration and authentication')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: false,
    },
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
