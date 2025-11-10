import express, { Router } from 'express';
import multer from 'multer';
import path from 'path';
import prisma from '../lib/prisma';
import { authenticate, isAdmin } from '../middleware/auth';
import fs from 'fs';

const router: Router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/problems';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  },
});

// Get all problems
router.get('/', async (req, res) => {
  try {
    const problems = await prisma.problem.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        votes: true,
        comments: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate vote counts
    const problemsWithVotes = problems.map((problem: any) => {
      const upvotes = problem.votes.filter((v: any) => v.type === 'UPVOTE').length;
      const downvotes = problem.votes.filter((v: any) => v.type === 'DOWNVOTE').length;
      return {
        ...problem,
        upvotes,
        downvotes,
        netVotes: upvotes - downvotes,
      };
    });

    res.json(problemsWithVotes);
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// Get single problem
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        votes: true,
        comments: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const upvotes = problem.votes.filter((v: any) => v.type === 'UPVOTE').length;
    const downvotes = problem.votes.filter((v: any) => v.type === 'DOWNVOTE').length;

    res.json({
      ...problem,
      upvotes,
      downvotes,
      netVotes: upvotes - downvotes,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// Create problem
router.post('/', authenticate, upload.array('images', 5), async (req: any, res) => {
  try {
    const { title, description } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const imagePaths = files ? files.map(file => `/uploads/problems/${file.filename}`) : [];

    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        images: imagePaths,
        userId: req.user.id,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    res.status(201).json(problem);
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ error: 'Failed to create problem' });
  }
});

// Update problem status (admin only)
router.patch('/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const problem = await prisma.problem.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update problem status' });
  }
});

export default router;
