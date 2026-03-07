import { IsString, IsUUID, IsOptional, IsUrl, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsUUID() receiverId: string;
  @IsString() @IsNotEmpty() content: string;
  @IsOptional() @IsUrl() fileUrl?: string;
}
