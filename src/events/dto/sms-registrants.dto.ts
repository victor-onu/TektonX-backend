import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SmsRegistrantsDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsIn(['all', 'volunteers', 'manual'])
  audience: 'all' | 'volunteers' | 'manual';

  // Only used when audience === 'manual'. Newline or comma separated phone numbers.
  // Not necessarily tied to any registrant record, e.g. a speaker or partner.
  @IsOptional()
  @IsString()
  manualPhones?: string;
}
