import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmailRegistrantsDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsIn(['all', 'volunteers', 'manual'])
  audience: 'all' | 'volunteers' | 'manual';

  // Only used when audience === 'manual'. Newline or comma separated — not
  // necessarily tied to any registrant record, e.g. a speaker or partner.
  @IsOptional()
  @IsString()
  manualEmails?: string;
}
