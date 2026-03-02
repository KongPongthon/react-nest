import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const PORT = process.env.PORT || 8070;
  app.use(cookieParser());
  await app.listen(PORT);

  console.log(`🚀 Server is running on: http://localhost:${PORT}`);
  console.log(`📡 WebSocket server is ready on: ws://localhost:${PORT}`);
  console.log('='.repeat(60));
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
