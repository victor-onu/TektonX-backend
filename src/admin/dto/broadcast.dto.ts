import { IsString, IsArray, ArrayMinSize, IsOptional, IsIn, MaxLength, MinLength, IsUUID } from 'class-validator';

export const BROADCAST_ROLES = ['mentee', 'mentor', 'admin'] as const;
export type BroadcastRole = (typeof BROADCAST_ROLES)[number];

export class BroadcastDto {
  @IsString() @MinLength(1) @MaxLength(200) subject: string;
  @IsString() @MinLength(1) @MaxLength(20000) body: string;
  @IsArray() @ArrayMinSize(1) @IsIn(BROADCAST_ROLES, { each: true }) roles: BroadcastRole[];
  @IsOptional() @IsArray() @IsString({ each: true }) tracks?: string[];
  @IsOptional() @IsArray() @IsUUID('all', { each: true }) cohortIds?: string[];
}
