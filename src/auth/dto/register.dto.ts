import { IsEmail, IsEnum, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Password must contain at least one uppercase letter and one number',
  })
  password: string;

  @ApiProperty({ enum: ['mentee', 'mentor'] })
  @IsEnum(['mentee', 'mentor'])
  role: 'mentee' | 'mentor';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  track: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({ enum: ['Beginner', 'Intermediate', 'Advanced'] })
  @IsOptional()
  @IsIn(['Beginner', 'Intermediate', 'Advanced'])
  experienceLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  experienceYears?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  profilePhotoUrl?: string;
}
