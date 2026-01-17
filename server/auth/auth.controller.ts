import { Request, Response } from 'express';
import { db } from '../../server/db';
import { users, insertUserSchema } from '../../shared/schema';
import { hashPassword, comparePassword, generateToken } from './auth.service';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signup = async (req: Request, res: Response) => {
  try {
    const userData = insertUserSchema.parse(req.body);

    const existingUser = await db.select().from(users).where(eq(users.email, userData.email.toLowerCase()));
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await hashPassword(userData.password);
    const newUser = await db.insert(users).values({ ...userData, password: hashedPassword, email: userData.email.toLowerCase() }).returning();

    if (!newUser[0]) {
      return res.status(500).json({ success: false, message: 'User registration failed' });
    }

    // Omit password from response
    const { password, ...userWithoutPassword } = newUser[0];
    res.status(201).json({ success: true, message: 'User registered successfully', data: userWithoutPassword });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error', errors: error.message });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = signInSchema.parse(req.body);

    const userArray = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    const user = userArray[0];

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, role: user.role });

    // Omit password from response
    const { password: userPassword, ...userWithoutPassword } = user;
    res.status(200).json({ success: true, message: 'Login successful', data: { token, user: userWithoutPassword } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error', errors: error.message });
  }
};
