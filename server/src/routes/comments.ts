import express, { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router: Router = express.Router();

// Add comment to a problem
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { problemId, text } = req.body;

    if (!text || !problemId) {
      return res.status(400).json({ error: 'Text and problemId are required' });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        userId: req.user.id,
        problemId,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Get comments for a problem
router.get('/problem/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { problemId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

export default router;
