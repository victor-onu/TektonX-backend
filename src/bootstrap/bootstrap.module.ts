import { Module } from '@nestjs/common';
import { BootstrapController } from './bootstrap.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [BootstrapController],
})
export class BootstrapModule {}
