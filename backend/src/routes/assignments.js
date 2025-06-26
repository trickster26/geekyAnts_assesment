import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index.js';
import { authenticateToken, requireManager } from '../middleware/auth.js';

const router = express.Router();

// Get all assignments (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId, projectId, status } = req.query;
    
    const where = {};
    if (userId) where.userId = userId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, seniority: true, hourlyCapacity: true }
        },
        project: {
          select: { id: true, name: true, status: true, priority: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create assignment (Manager only)
router.post('/', [
  authenticateToken,
  requireManager,
  body('userId').isString(),
  body('projectId').isString(),
  body('allocatedHours').isInt({ min: 1, max: 16 }),
  body('startDate').isISO8601(),
  body('endDate').optional().isISO8601(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, projectId, allocatedHours, startDate, endDate, notes } = req.body;

    // Check capacity
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        assignments: {
          where: {
            status: 'ACTIVE',
            startDate: { lte: new Date(endDate || startDate) },
            OR: [
              { endDate: null },
              { endDate: { gte: new Date(startDate) } }
            ]
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentAllocation = user.assignments.reduce((sum, assignment) => 
      sum + assignment.allocatedHours, 0
    );

    if (currentAllocation + allocatedHours > (user.hourlyCapacity || 8)) {
      return res.status(400).json({ 
        error: 'Assignment exceeds user capacity',
        details: {
          currentAllocation,
          requestedHours: allocatedHours,
          totalCapacity: user.hourlyCapacity || 8,
          availableHours: (user.hourlyCapacity || 8) - currentAllocation
        }
      });
    }

    const assignment = await prisma.assignment.create({
      data: {
        userId,
        projectId,
        allocatedHours,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, seniority: true }
        },
        project: {
          select: { id: true, name: true, status: true, priority: true }
        }
      }
    });

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });

  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 