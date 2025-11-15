import express, { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { sendOTP } from '../lib/nodemailer';
import { authenticate } from '../middleware/auth';

const router: Router = express.Router();

// Send OTP for signup
router.post('/signup/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email.endsWith('@iiitdwd.ac.in')) {
      return res.status(400).json({ error: 'Please use your college email (@iiitdwd.ac.in)' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered. Please login instead.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oTP.create({
      data: { email, code: otp, expiresAt },
    });

    await sendOTP(email, otp);
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Signup OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and complete signup
router.post('/signup/verify', async (req, res) => {
  try {
    const { email, otp, name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    const otpRecord = await prisma.oTP.findFirst({
      where: { email, code: otp, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await prisma.oTP.delete({ where: { id: otpRecord.id } });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if student format: 23bcs006@iiitdwd.ac.in (2 digits + 3 letters + 3 digits)
    const studentPattern = /^\d{2}[a-zA-Z]{3}\d{3}@iiitdwd\.ac\.in$/;
    const isAdmin = !studentPattern.test(email);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isAdmin,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Signup verify error:', error);
    res.status(500).json({ error: 'Failed to complete signup' });
  }
});

// Login with password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email.endsWith('@iiitdwd.ac.in')) {
      return res.status(400).json({ error: 'Please use your college email (@iiitdwd.ac.in)' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User not found. Please signup first.' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'Password not set. Please signup again.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

export default router;
