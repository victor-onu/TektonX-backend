import { IsUUID, IsArray, ArrayMinSize, IsOptional } from 'class-validator';

export class AssignMenteesDto {
  @IsUUID() mentorId: string;
  @IsArray() @ArrayMinSize(1) @IsUUID('all', { each: true }) menteeIds: string[];
  @IsOptional() @IsUUID() cohortId?: string;
}
