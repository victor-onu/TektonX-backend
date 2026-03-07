import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  getConversations(@CurrentUser() user: User) {
    return this.messagesService.getConversations(user.id);
  }

  @Get(':partnerId')
  async getMessages(@Param('partnerId') partnerId: string, @CurrentUser() user: User) {
    await this.messagesService.markConversationAsRead(user.id, partnerId);
    return this.messagesService.getMessages(user.id, partnerId);
  }

  @Post()
  sendMessage(@CurrentUser() user: User, @Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(user.id, dto);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.messagesService.markAsRead(id, user.id);
  }
}
