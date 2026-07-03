import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://10.10.248.140',
      'https://10.10.248.140',
      'https://medsync.cs.colman.ac.il',
    ],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
