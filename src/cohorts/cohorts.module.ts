import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cohort } from './entities/cohort.entity';
import { User } from '../users/entities/user.entity';
import { CohortsService } from './cohorts.service';
import { CohortsController } from './cohorts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cohort, User])],
  controllers: [CohortsController],
  providers: [CohortsService],
  exports: [CohortsService],
})
export class CohortsModule {}
