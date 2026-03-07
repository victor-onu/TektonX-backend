import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';

const ADMIN_EMAIL = 'admin@tektonx.com';
const ADMIN_PASSWORD = 'TektonX@2026';
const ADMIN_NAME = 'TektonX Admin';

export async function seedAdmin(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existing = await userRepo.findOne({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    // Force-update the password and role in case it was registered manually
    await userRepo.update(existing.id, {
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });
    console.log('✅ Admin user updated (password reset):');
  } else {
    await userRepo.save(
      userRepo.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        track: 'Admin',
      }),
    );
    console.log('✅ Admin user created:');
  }

  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
}
