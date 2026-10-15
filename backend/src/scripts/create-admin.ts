import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!connectionString || !name || !email || !password) {
    throw new Error(
      'DATABASE_URL, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required',
    );
  }

  if (password.length < 16) {
    throw new Error('Admin password must be at least 16 characters');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });

    if (existing?.role === 'ADMIN') {
      throw new Error(
        'An admin with this email already exists. Refusing to reset credentials.',
      );
    }

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
        emailVerifiedAt: new Date(),
      },
      create: {
        name,
        email,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
        emailVerifiedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log('Admin account created or promoted:', admin);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Failed to create admin:', error);
  process.exitCode = 1;
});