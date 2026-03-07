import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certService: CertificatesService) {}

  @ApiBearerAuth()
  @Get('me')
  async getMyCertificate(@CurrentUser() user: User) {
    return this.certService.getMyCertificate(user.id);
  }

  @ApiBearerAuth()
  @Post('generate')
  async generateCertificate(@CurrentUser() user: User) {
    return this.certService.generateCertificate(user.id);
  }

  @Public()
  @Get('verify/:code')
  verifyCertificate(@Param('code') code: string) {
    return this.certService.verifyCertificate(code);
  }
}
