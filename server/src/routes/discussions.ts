import express, { Router } from 'express';
import multer from 'multer';
import path from 'path';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import fs from 'fs';

const router: Router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/discussions';
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

// Get all discussions
router.get('/', async (req, res) => {
  try {
    const discussions = await prisma.discussion.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true, isAdmin: true },
        },
        votes: true,
        comments: {
          where: { parentCommentId: null }, // Only get top-level comments
          include: {
            user: {
              select: { id: true, email: true, name: true, isAdmin: true },
            },
            votes: true,
            replies: {
              include: {
                user: {
                  select: { id: true, email: true, name: true, isAdmin: true },
                },
                votes: true,
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate vote counts
    const discussionsWithVotes = discussions.map((discussion: any) => {
      const upvotes = discussion.votes.filter((v: any) => v.type === 'UPVOTE').length;
      const downvotes = discussion.votes.filter((v: any) => v.type === 'DOWNVOTE').length;
      return {
        ...discussion,
        upvotes,
        downvotes,
        netVotes: upvotes - downvotes,
      };
    });

    res.json(discussionsWithVotes);
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

// Get single discussion by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true, isAdmin: true },
        },
        votes: true,
        comments: {
          where: { parentCommentId: null }, // Only get top-level comments
          include: {
            user: {
              select: { id: true, email: true, name: true, isAdmin: true },
            },
            votes: true,
            replies: {
              include: {
                user: {
                  select: { id: true, email: true, name: true, isAdmin: true },
                },
                votes: true,
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    // Calculate vote counts
    const upvotes = discussion.votes.filter((v: any) => v.type === 'UPVOTE').length;
    const downvotes = discussion.votes.filter((v: any) => v.type === 'DOWNVOTE').length;

    res.json({
      ...discussion,
      upvotes,
      downvotes,
      netVotes: upvotes - downvotes,
    });
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({ error: 'Failed to fetch discussion' });
  }
});

// Create a new discussion
router.post('/', authenticate, upload.array('images', 5), async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const imagePaths = files ? files.map(file => `/uploads/discussions/${file.filename}`) : [];

    const discussion = await prisma.discussion.create({
      data: {
        title,
        description,
        images: imagePaths,
        userId: req.user!.id,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, isAdmin: true },
        },
      },
    });

    res.status(201).json(discussion);
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({ error: 'Failed to create discussion' });
  }
});

// Add comment or reply to discussion
router.post('/:id/comments', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { text, parentCommentId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = await prisma.discussionComment.create({
      data: {
        text: text,
        userId: req.user!.id,
        discussionId: id,
        parentCommentId: parentCommentId || null,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, isAdmin: true },
        },
        votes: true,
        replies: {
          include: {
            user: {
              select: { id: true, email: true, name: true, isAdmin: true },
            },
            votes: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Vote on comment
router.post('/comments/:commentId/vote', authenticate, async (req: AuthRequest, res) => {
  try {
    const { commentId } = req.params;
    const { type } = req.body;

    if (!['UPVOTE', 'DOWNVOTE'].includes(type)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Check if user already voted
    const existingVote = await prisma.discussionCommentVote.findUnique({
      where: {
        userId_commentId: {
          userId: req.user!.id,
          commentId: commentId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if clicking same button
        await prisma.discussionCommentVote.delete({
          where: { id: existingVote.id },
        });
        return res.json({ action: 'removed', type });
      } else {
        // Update vote if clicking opposite button
        await prisma.discussionCommentVote.update({
          where: { id: existingVote.id },
          data: { type },
        });
        return res.json({ action: 'updated', type });
      }
    }

    // Create new vote
    await prisma.discussionCommentVote.create({
      data: {
        type,
        userId: req.user!.id,
        commentId: commentId,
      },
    });

    res.json({ action: 'created', type });
  } catch (error) {
    console.error('Comment vote error:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

// Vote on discussion
router.post('/:id/vote', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!['UPVOTE', 'DOWNVOTE'].includes(type)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Check if user already voted
    const existingVote = await prisma.discussionVote.findUnique({
      where: {
        userId_discussionId: {
          userId: req.user!.id,
          discussionId: id,
        },
      },
    });

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if clicking same button
        await prisma.discussionVote.delete({
          where: { id: existingVote.id },
        });
        return res.json({ action: 'removed', type });
      } else {
        // Update vote if clicking opposite button
        await prisma.discussionVote.update({
          where: { id: existingVote.id },
          data: { type },
        });
        return res.json({ action: 'updated', type });
      }
    }

    // Create new vote
    await prisma.discussionVote.create({
      data: {
        type,
        userId: req.user!.id,
        discussionId: id,
      },
    });

    res.json({ action: 'created', type });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

export default router;
