import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { authenticateToken, requireManager, requireEngineerOrManager, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get all assignments (with filters)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId, projectId, status } = req.query;
    
    const where: any = {};
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
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, projectId, allocatedHours, startDate, endDate, notes } = req.body;

    // Check if user exists and has capacity
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

    // Calculate current allocation
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

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
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

// Update assignment
router.put('/:id', [
  authenticateToken,
  requireManager,
  body('allocatedHours').optional().isInt({ min: 1, max: 16 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('status').optional().isIn(['ACTIVE', 'COMPLETED', 'CANCELLED']),
  body('notes').optional().trim()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData: any = {};

    const { allocatedHours, startDate, endDate, status, notes } = req.body;
    if (allocatedHours !== undefined) updateData.allocatedHours = allocatedHours;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const assignment = await prisma.assignment.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, seniority: true }
        },
        project: {
          select: { id: true, name: true, status: true, priority: true }
        }
      }
    });

    res.json({
      message: 'Assignment updated successfully',
      assignment
    });

  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user capacity overview
router.get('/capacity/:userId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            project: {
              select: { id: true, name: true, priority: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalAllocated = user.assignments.reduce((sum, assignment) => 
      sum + assignment.allocatedHours, 0
    );

    const capacity = {
      userId: user.id,
      userName: user.name,
      totalCapacity: user.hourlyCapacity || 8,
      allocatedHours: totalAllocated,
      availableHours: (user.hourlyCapacity || 8) - totalAllocated,
      utilizationPercentage: Math.round((totalAllocated / (user.hourlyCapacity || 8)) * 100),
      assignments: user.assignments
    };

    res.json({ capacity });

  } catch (error) {
    console.error('Get capacity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 