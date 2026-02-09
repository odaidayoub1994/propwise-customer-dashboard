import 'dotenv/config';

import { DataSource } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Customer],
  migrations: ['src/migrations/*.ts'],
});
