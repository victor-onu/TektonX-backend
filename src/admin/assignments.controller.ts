import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MentorAssignment } from './entities/mentor-assignment.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('assignments')
@ApiBearerAuth()
@Controller('assignments')
export class AssignmentsController {
  constructor(
    @InjectRepository(MentorAssignment)
    private readonly assignmentRepo: Repository<MentorAssignment>,
  ) {}

  @Get('my')
  async getMyAssignment(@CurrentUser() user: User) {
    if ((user.role as string) === UserRole.MENTEE) {
      return this.assignmentRepo.findOne({
        where: { menteeId: user.id },
        relations: ['mentor'],
      });
    }
    if ((user.role as string) === UserRole.MENTOR) {
      return this.assignmentRepo.find({
        where: { mentorId: user.id },
        relations: ['mentee'],
      });
    }
    return null;
  }
}
