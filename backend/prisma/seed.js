import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Hash password for demo accounts
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create demo manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@demo.com' },
    update: {},
    create: {
      email: 'manager@demo.com',
      password: hashedPassword,
      name: 'Sarah Johnson',
      role: 'MANAGER',
    },
  });

  // Create demo engineers
  const engineer1 = await prisma.user.upsert({
    where: { email: 'engineer@demo.com' },
    update: {},
    create: {
      email: 'engineer@demo.com',
      password: hashedPassword,
      name: 'Alex Chen',
      role: 'ENGINEER',
      skills: 'React, Node.js, PostgreSQL',
      seniority: 'SENIOR',
      hourlyCapacity: 8,
    },
  });

  const engineer2 = await prisma.user.upsert({
    where: { email: 'john.smith@demo.com' },
    update: {},
    create: {
      email: 'john.smith@demo.com',
      password: hashedPassword,
      name: 'John Smith',
      role: 'ENGINEER',
      skills: 'Python, Django, AWS',
      seniority: 'MID',
      hourlyCapacity: 8,
    },
  });

  const engineer3 = await prisma.user.upsert({
    where: { email: 'emma.davis@demo.com' },
    update: {},
    create: {
      email: 'emma.davis@demo.com',
      password: hashedPassword,
      name: 'Emma Davis',
      role: 'ENGINEER',
      skills: 'JavaScript, Vue.js, MongoDB',
      seniority: 'JUNIOR',
      hourlyCapacity: 8,
    },
  });

  // Create demo projects
  const project1 = await prisma.project.upsert({
    where: { id: 'demo-project-1' },
    update: {},
    create: {
      id: 'demo-project-1',
      name: 'E-Commerce Platform Redesign',
      description: 'Complete redesign of the company e-commerce platform with modern React architecture',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-04-15'),
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      managerId: manager.id,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'demo-project-2' },
    update: {},
    create: {
      id: 'demo-project-2',
      name: 'Mobile API Development',
      description: 'Develop RESTful APIs for the new mobile application',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-05-01'),
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      managerId: manager.id,
    },
  });

  const project3 = await prisma.project.upsert({
    where: { id: 'demo-project-3' },
    update: {},
    create: {
      id: 'demo-project-3',
      name: 'Data Analytics Dashboard',
      description: 'Create internal dashboard for data analytics and reporting',
      startDate: new Date('2025-03-01'),
      priority: 'LOW',
      status: 'PLANNING',
      managerId: manager.id,
    },
  });

  // Create demo assignments
  await prisma.assignment.upsert({
    where: { id: 'demo-assignment-1' },
    update: {},
    create: {
      id: 'demo-assignment-1',
      userId: engineer1.id,
      projectId: project1.id,
      allocatedHours: 6,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-04-15'),
      status: 'ACTIVE',
      notes: 'Lead frontend development',
    },
  });

  await prisma.assignment.upsert({
    where: { id: 'demo-assignment-2' },
    update: {},
    create: {
      id: 'demo-assignment-2',
      userId: engineer2.id,
      projectId: project2.id,
      allocatedHours: 8,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-05-01'),
      status: 'ACTIVE',
      notes: 'API architecture and development',
    },
  });

  await prisma.assignment.upsert({
    where: { id: 'demo-assignment-3' },
    update: {},
    create: {
      id: 'demo-assignment-3',
      userId: engineer3.id,
      projectId: project1.id,
      allocatedHours: 4,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-04-15'),
      status: 'ACTIVE',
      notes: 'UI component development',
    },
  });

  await prisma.assignment.upsert({
    where: { id: 'demo-assignment-4' },
    update: {},
    create: {
      id: 'demo-assignment-4',
      userId: engineer1.id,
      projectId: project2.id,
      allocatedHours: 2,
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-03-15'),
      status: 'ACTIVE',
      notes: 'Technical consultation',
    },
  });

  console.log('Database seed completed successfully!');
  console.log('Created:');
  console.log('   - 1 Manager (manager@demo.com)');
  console.log('   - 3 Engineers');
  console.log('   - 3 Projects');
  console.log('   - 4 Assignments');
  console.log('Demo credentials: password123');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 