import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsString() @IsNotEmpty() title: string;
  @IsDateString() date: string;
  @IsString() @IsNotEmpty() time: string;
  @IsString() @IsNotEmpty() type: string;
}
