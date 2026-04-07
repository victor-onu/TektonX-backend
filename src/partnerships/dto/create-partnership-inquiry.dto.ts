import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreatePartnershipInquiryDto {
  @IsString() @IsNotEmpty()
  companyName: string

  @IsString() @IsNotEmpty()
  contactName: string

  @IsEmail()
  email: string

  @IsOptional() @IsString()
  phone?: string

  @IsIn(['sponsor', 'hiring', 'both'])
  partnershipType: string

  @IsOptional() @IsString()
  message?: string
}
