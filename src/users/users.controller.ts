import { Controller, Get, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users/me')
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Put('users/me')
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Put('users/me/notification-preferences')
  updateNotificationPreferences(@CurrentUser() user: User, @Body() body: Record<string, boolean>) {
    return this.usersService.updateNotificationPreferences(user.id, body);
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Public()
  @Get('mentors')
  getPublicMentors(@Query('track') track?: string) {
    return this.usersService.getApprovedMentors(track);
  }
}
