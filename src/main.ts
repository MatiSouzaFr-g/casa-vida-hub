import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  app.enableCors({ origin: '*' });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Kingdom Hub API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  console.log(`\n🏛️  Kingdom Hub corriendo en http://localhost:${port}`);
  console.log(`📚 Docs en http://localhost:${port}/api/docs\n`);
}
bootstrap();
