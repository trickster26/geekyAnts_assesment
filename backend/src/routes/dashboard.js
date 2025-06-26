import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    // Get basic counts
    const [totalProjects, totalUsers, totalAssignments] = await Promise.all([
      prisma.project.count(),
      prisma.user.count(),
      prisma.assignment.count({ where: { status: 'ACTIVE' } })
    ]);

    // Get project status distribution
    const projectStatusCounts = await prisma.project.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    // Get user capacity utilization
    const users = await prisma.user.findMany({
      include: {
        assignments: {
          where: { status: 'ACTIVE' },
          select: { allocatedHours: true }
        }
      }
    });

    const capacityData = users.map(user => {
      const totalAllocated = user.assignments.reduce((sum, assignment) => 
        sum + assignment.allocatedHours, 0
      );
      const capacity = user.hourlyCapacity || 8;
      return {
        userId: user.id,
        name: user.name,
        role: user.role,
        capacity,
        allocated: totalAllocated,
        available: capacity - totalAllocated,
        utilization: Math.round((totalAllocated / capacity) * 100)
      };
    });

    // Get projects by priority
    const projectPriorityCounts = await prisma.project.groupBy({
      by: ['priority'],
      _count: { id: true }
    });

    const analytics = {
      overview: {
        totalProjects,
        totalUsers,
        totalAssignments,
        avgUtilization: Math.round(
          capacityData.reduce((sum, user) => sum + user.utilization, 0) / capacityData.length
        )
      },
      projectStatusDistribution: projectStatusCounts.map(item => ({
        status: item.status,
        count: item._count.id
      })),
      projectPriorityDistribution: projectPriorityCounts.map(item => ({
        priority: item.priority,
        count: item._count.id
      })),
      userCapacityOverview: capacityData,
      overAllocatedUsers: capacityData.filter(user => user.utilization > 100),
      underUtilizedUsers: capacityData.filter(user => user.utilization < 70)
    };

    res.json({ analytics });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get team workload
router.get('/workload', authenticateToken, async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: {
          select: { id: true, name: true, seniority: true, hourlyCapacity: true }
        },
        project: {
          select: { id: true, name: true, priority: true, endDate: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    const workloadData = assignments.reduce((acc, assignment) => {
      const userId = assignment.user.id;
      if (!acc[userId]) {
        acc[userId] = {
          user: assignment.user,
          totalHours: 0,
          projects: []
        };
      }
      acc[userId].totalHours += assignment.allocatedHours;
      acc[userId].projects.push({
        id: assignment.project.id,
        name: assignment.project.name,
        priority: assignment.project.priority,
        allocatedHours: assignment.allocatedHours,
        endDate: assignment.project.endDate
      });
      return acc;
    }, {});

    res.json({ workload: Object.values(workloadData) });

  } catch (error) {
    console.error('Get workload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 