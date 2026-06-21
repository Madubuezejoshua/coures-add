import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool, query } from './db.js';

// Usage: node server/seed-admin.js <email> <password> [Full Name]
async function main() {
  const [, , email, password, ...nameParts] = process.argv;
  if (!email || !password) {
    console.error('Usage: npm run seed:admin -- <email> <password> [Full Name]');
    process.exit(1);
  }
  const fullName = nameParts.join(' ') || 'Administrator';
  const hash = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO users (email, password_hash, full_name, role, status)
     VALUES ($1,$2,$3,'admin','active')
     ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, role='admin', status='active'`,
    [email.trim().toLowerCase(), hash, fullName]
  );
  console.log(`[seed] admin ready: ${email}`);
  await pool.end();
}

main().catch((e) => {
  console.error('[seed] failed:', e.message);
  process.exit(1);
});
