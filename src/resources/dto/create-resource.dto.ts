import { IsString, IsUrl, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateResourceDto {
  @IsOptional() @IsString() taskId?: string;
  @IsOptional() @IsString() track?: string;
  @IsString() @IsNotEmpty() title: string;
  @IsUrl() url: string;
}
