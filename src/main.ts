import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Room Reservation')
    .setDescription('The Room Reservation API description')
    .setVersion('1.0')
    .build();
  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: 'API Room Reservation',
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, customOptions);

  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1/');
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
