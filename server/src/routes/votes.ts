import express, { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// Vote on a problem
router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const { problemId, type } = req.body;

    if (!problemId || !type) {
      return res.status(400).json({ error: 'ProblemId and type are required' });
    }

    if (!['UPVOTE', 'DOWNVOTE'].includes(type)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_problemId: {
          userId: req.user.id,
          problemId,
        },
      },
    });

    if (existingVote) {
      // If same vote, remove it
      if (existingVote.type === type) {
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        return res.json({ message: 'Vote removed', action: 'removed' });
      }
      
      // Otherwise, update the vote
      const vote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: { type },
      });
      return res.json({ vote, action: 'updated' });
    }

    // Create new vote
    const vote = await prisma.vote.create({
      data: {
        type,
        userId: req.user.id,
        problemId,
      },
    });

    res.status(201).json({ vote, action: 'created' });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

// Get user's vote for a problem
router.get('/problem/:problemId/user', authenticate, async (req: any, res: Response) => {
  try {
    const { problemId } = req.params;

    const vote = await prisma.vote.findUnique({
      where: {
        userId_problemId: {
          userId: req.user.id,
          problemId,
        },
      },
    });

    res.json({ vote });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vote' });
  }
});

export default router;
