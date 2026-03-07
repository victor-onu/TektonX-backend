import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';
import { seedTasks } from './tasks.seed';
import { seedAdmin } from './admin.seed';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'tektonx',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'tektonx',
  entities: [__dirname + '/../../**/*.entity.{ts,js}'],
  synchronize: false,
});

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected. Running seeds...');
    await seedAdmin(AppDataSource);
    await seedTasks(AppDataSource);
    console.log('Seeding complete!');
    await AppDataSource.destroy();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

main();
