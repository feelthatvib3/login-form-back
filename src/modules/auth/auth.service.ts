import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from 'src/db';

import { env } from 'config/env';

export class AuthService {
  async register(email: string, password: string, name?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash, name }
    });

    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
    return { token };
  }
}
