import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
} from './env.config';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: false,
  autoLoadEntities: true,
  migrationsRun: true,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
};
