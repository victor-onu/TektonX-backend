import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Certificate } from './entities/certificate.entity';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(
    @InjectRepository(Certificate) private readonly certRepo: Repository<Certificate>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    private readonly config: ConfigService,
  ) {}

  private generateCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  async generateCertificate(userId: string): Promise<Certificate> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const [m1Total, m2Total, m3Total] = await Promise.all([
      this.taskRepo.count({ where: { userId: null as any, milestone: 1 } }),
      this.taskRepo.count({ where: { userId: null as any, milestone: 2 } }),
      this.taskRepo.count({ where: { userId: null as any, milestone: 3 } }),
    ]);

    if (
      user.milestone1Completed < m1Total ||
      user.milestone2Completed < m2Total ||
      user.milestone3Completed < m3Total
    ) {
      throw new BadRequestException('Not all milestones are complete');
    }

    const existing = await this.certRepo.findOne({ where: { userId } });
    if (existing) return existing;

    const verificationCode = this.generateCode();
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:5173');

    // Generate simple PDF using PDFKit
    let pdfUrl: string | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const PDFDocument = require('pdfkit');
      const uploadDir = this.config.get<string>('storage.uploadDir', './uploads');
      const certDir = path.join(uploadDir, 'certificates');
      if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });
      const filename = `${verificationCode}.pdf`;
      const filePath = path.join(certDir, filename);
      pdfUrl = `/uploads/files/certificates/${filename}`;

      await new Promise<void>((resolve, reject) => {
        const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        doc
          .fontSize(36)
          .font('Helvetica-Bold')
          .text('CERTIFICATE OF COMPLETION', { align: 'center' });
        doc.moveDown();
        doc.fontSize(18).font('Helvetica').text('This is to certify that', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(28).font('Helvetica-Bold').text(user.name, { align: 'center' });
        doc.moveDown(0.5);
        doc
          .fontSize(16)
          .font('Helvetica')
          .text(
            'has successfully completed the 12-week TektonX Mentorship Program',
            { align: 'center' },
          );
        doc.moveDown();
        doc.fontSize(14).text(`Track: ${user.track}`, { align: 'center' });
        doc.text(`Completed on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown();
        doc
          .fontSize(12)
          .text(`Verification Code: ${verificationCode}`, { align: 'center' });
        doc.moveDown();
        doc
          .fontSize(10)
          .fillColor('#666')
          .text(
            `www.tektonxlabs.org | Verify at: ${frontendUrl}/verify/${verificationCode}`,
            { align: 'center' },
          );
        doc.end();
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
    } catch (err) {
      this.logger.error('PDF generation failed', err);
    }

    const cert = this.certRepo.create({
      userId,
      track: user.track,
      verificationCode,
      completedAt: new Date(),
      pdfUrl: pdfUrl ?? undefined,
    });
    const saved = await this.certRepo.save(cert);
    this.logger.log(`Certificate generated for user ${userId}: ${verificationCode}`);
    return saved;
  }

  async getMyCertificate(userId: string): Promise<Certificate | null> {
    return this.certRepo.findOne({ where: { userId } });
  }

  async verifyCertificate(code: string) {
    const cert = await this.certRepo.findOne({ where: { verificationCode: code } });
    if (!cert) throw new NotFoundException('Certificate not found');

    const user = await this.userRepo.findOne({ where: { id: cert.userId } });

    return {
      verified: true,
      user: { name: user?.name ?? 'Unknown' },
      track: cert.track,
      completedAt: cert.completedAt,
      verificationCode: cert.verificationCode,
    };
  }
}
