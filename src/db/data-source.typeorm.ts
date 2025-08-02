import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { getConfiguration } from '../configuration/configuration';

config({ path: './src/env/.env' });

export default new DataSource({
  type: 'postgres',
  migrationsTableName: 'Migrations',
  url: getConfiguration().databaseUrl,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
});
