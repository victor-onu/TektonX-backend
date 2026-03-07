/**
 * Standalone admin creation script — no TypeScript, no ts-node needed.
 * Run with: node scripts/create-admin.js
 */

require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const ADMIN_EMAIL = 'admin@tektonx.com';
const ADMIN_PASSWORD = 'TektonX@2026';
const ADMIN_NAME = 'TektonX Admin';

async function main() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'tektonx',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'tektonx',
  });

  await client.connect();
  console.log('Connected to database.');

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existing = await client.query(
    'SELECT id FROM users WHERE email = $1',
    [ADMIN_EMAIL],
  );

  if (existing.rows.length > 0) {
    await client.query(
      `UPDATE users SET password_hash = $1, role = 'admin', status = 'active' WHERE email = $2`,
      [passwordHash, ADMIN_EMAIL],
    );
    console.log('✅ Admin password updated successfully.');
  } else {
    const { v4: uuidv4 } = require('uuid');
    const defaultNotifs = JSON.stringify({
      announcements: true,
      sessionReminders: true,
      weeklyProgress: false,
      milestoneCompletions: true,
    });
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role, status, track, email_notifications, milestone1_completed, milestone2_completed, milestone3_completed, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'admin', 'active', 'Admin', $5, 0, 0, 0, NOW(), NOW())`,
      [uuidv4(), ADMIN_NAME, ADMIN_EMAIL, passwordHash, defaultNotifs],
    );
    console.log('✅ Admin user created.');
  }

  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);

  await client.end();
}

main().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
