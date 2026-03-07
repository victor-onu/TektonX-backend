import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CohortsService } from './cohorts.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';

@ApiTags('cohorts')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('cohorts')
export class CohortsController {
  constructor(private readonly cohortsService: CohortsService) {}

  @Post()
  create(@Body() dto: CreateCohortDto) {
    return this.cohortsService.create(dto);
  }

  @Get()
  findAll() {
    return this.cohortsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cohortsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCohortDto) {
    return this.cohortsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.cohortsService.delete(id);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.cohortsService.getCohortMembers(id);
  }
}
