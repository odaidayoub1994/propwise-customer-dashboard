import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { transports } from 'winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { winstonFormat } from './config/logger';
import { RedisModule } from './redis/redis.module';
import { CacheModule } from './cache/cache.module';
import { SocketModule } from './socket/socket.module';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WinstonModule.forRoot({
      level: process.env.LOG_LEVEL || 'info',
      format: winstonFormat,
      transports: [new transports.Console()],
    }),
    TypeOrmModule.forRoot(databaseConfig),
    RedisModule,
    CacheModule,
    SocketModule,
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
