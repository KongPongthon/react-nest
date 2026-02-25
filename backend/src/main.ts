import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
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

  await app.listen(PORT);

  console.log(`🚀 Server is running on: http://localhost:${PORT}`);
  console.log(`📡 WebSocket server is ready on: ws://localhost:${PORT}`);
  console.log('='.repeat(60));
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
