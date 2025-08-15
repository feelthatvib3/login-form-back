import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db.js';
import { env } from '../../config/env.js';
export class AuthService {
    async register(email, password, name) {
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
    async login(email, password) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            throw new Error('Incorrect credentials. Please try again.');
        }
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new Error('Incorrect credentials. Please try again.');
        }
        const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
        return { token };
    }
    async me(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                passwordHash: false,
                avatarUrl: true,
                email: true,
                name: true,
                id: true,
                createdAt: true,
                githubId: true
            }
        });
        return user;
    }
}
