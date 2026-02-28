import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { formatValidationErrors } from './common/errors/validation-error.formatter';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
//entry point
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,//dtoda olmayan alanları bodyden siler
      forbidNonWhitelisted: true,//dtoda olmayan alanlarda 400 hata fırlatır
      transform: true,//DTO decorator’larının nested çalışması ve tip dönüşümleri için iyi.
      exceptionFactory: (errors) => {
        return new BadRequestException(formatValidationErrors(errors));
      },
    }),
  );
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  app.enableShutdownHooks();
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);


  process.on('SIGINT', () => logger.warn('SIGINT received (Ctrl+C). Shutting down...'));
  process.on('SIGTERM', () => logger.warn('SIGTERM received. Shutting down...'));
}
bootstrap();
