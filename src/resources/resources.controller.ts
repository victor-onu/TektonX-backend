import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@ApiTags('resources')
@ApiBearerAuth()
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Roles(UserRole.MENTOR)
  @Get('mine')
  getMine(@CurrentUser() user: User) {
    return this.resourcesService.getByCreator(user.id);
  }

  @Get()
  getResources(@Query('taskId') taskId?: string, @Query('track') track?: string) {
    if (taskId) return this.resourcesService.getByTaskId(taskId);
    if (track) return this.resourcesService.getByTrack(track);
    return this.resourcesService.getAll();
  }

  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateResourceDto) {
    const userTrack = user.role === UserRole.MENTOR ? user.track : undefined;
    return this.resourcesService.create(dto, user.id, userTrack);
  }

  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Put(':id')
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdateResourceDto) {
    return this.resourcesService.update(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.resourcesService.delete(id, user);
  }
}
