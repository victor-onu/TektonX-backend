import { IsString, IsInt, IsBoolean, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsString() @IsNotEmpty() taskId: string;
  @IsInt() @Min(1) @Max(3) @Type(() => Number) milestone: number;
  @IsInt() @Min(1) @Max(12) @Type(() => Number) week: number;
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() description: string;
  @IsOptional() @IsBoolean() completed?: boolean;
}
