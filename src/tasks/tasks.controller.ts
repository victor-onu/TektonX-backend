import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('templates')
  getTemplates(@Query('milestone') milestone?: string) {
    return this.tasksService.getTemplates(milestone ? parseInt(milestone) : undefined);
  }

  @Roles(UserRole.MENTEE)
  @Get('my')
  getMyTasks(@CurrentUser() user: User) {
    return this.tasksService.getMyTasks(user.id);
  }

  @Roles(UserRole.MENTEE)
  @Post()
  createPersonalCopy(@CurrentUser() user: User, @Body() dto: CreateTaskDto) {
    return this.tasksService.createPersonalCopy(user.id, dto);
  }

  @Roles(UserRole.MENTEE)
  @Put(':id')
  updateTask(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdateTaskDto) {
    return this.tasksService.updateTask(id, user.id, dto);
  }
}
