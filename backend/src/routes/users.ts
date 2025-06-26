import express from 'express';
import { prisma } from '../index';
import { authenticateToken, requireManager, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get all users (engineers)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        skills: true,
        seniority: true,
        hourlyCapacity: true,
        createdAt: true,
        assignments: {
          where: { status: 'ACTIVE' },
          select: { id: true, allocatedHours: true, project: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 