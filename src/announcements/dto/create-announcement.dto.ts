import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional, IsUrl } from 'class-validator';
import { AnnouncementType } from '../../common/enums/announcement-type.enum';

export class CreateAnnouncementDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() content: string;
  @IsEnum(AnnouncementType) type: AnnouncementType;
  @IsDateString() date: string;
  @IsOptional() @IsUrl() flierUrl?: string;
}
