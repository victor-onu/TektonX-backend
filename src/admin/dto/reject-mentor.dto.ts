import { IsOptional, IsString } from 'class-validator';

export class RejectMentorDto {
  @IsOptional() @IsString() reason?: string;
}
