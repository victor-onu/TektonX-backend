import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { NIGERIAN_STATES } from '../../common/constants/nigerian-states.constant';

export class CreateCommunityMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsIn(NIGERIAN_STATES)
  state: string;
}
