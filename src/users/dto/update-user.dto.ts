import { IsOptional, IsString, IsUrl, IsInt, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsString() @MaxLength(500) bio?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() @IsUrl() profilePhotoUrl?: string;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) experienceYears?: number;
  @IsOptional() @IsString() @IsUrl() linkedinUrl?: string;
}
