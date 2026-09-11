import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventRegistrationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsString()
  organisation?: string;

  @IsOptional()
  @IsIn(['yes', 'maybe', 'no'])
  volunteer?: string;

  @IsOptional()
  @IsString()
  question?: string;
}
