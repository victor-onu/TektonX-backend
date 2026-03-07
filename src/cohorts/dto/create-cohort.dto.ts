import { IsString, IsInt, IsDateString, IsNotEmpty, Min } from 'class-validator';

export class CreateCohortDto {
  @IsString() @IsNotEmpty() name: string;
  @IsInt() @Min(1) number: number;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
}
