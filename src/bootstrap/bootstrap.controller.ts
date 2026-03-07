import { Controller, Post, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';

@ApiTags('bootstrap')
@ApiBearerAuth()
@Controller('bootstrap')
export class BootstrapController {
  constructor(private readonly usersService: UsersService) {}

  @Post('promote-to-admin')
  async promoteToAdmin(@CurrentUser() user: User) {
    const adminCount = await this.usersService.countAdmins();
    if (adminCount > 0) {
      throw new ForbiddenException(
        'Admin already exists. This endpoint is only for first-time setup.',
      );
    }
    await this.usersService.updateRole(user.id, UserRole.ADMIN);
    await this.usersService.updateStatus(user.id, UserStatus.ACTIVE);
    const updated = await this.usersService.findById(user.id);
    return { message: 'You are now an admin.', user: updated };
  }
}
