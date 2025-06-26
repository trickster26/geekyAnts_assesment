# Engineering Resource Management System

A comprehensive full-stack application for managing engineering team assignments across projects, tracking capacity allocation, and monitoring resource utilization.

## Features

### Core Functionality
- **Authentication System**: Role-based access control (Manager & Engineer roles)
- **Engineer Management**: Track team members, skills, seniority levels, and capacity
- **Project Management**: Create, update, and monitor engineering projects
- **Assignment System**: Allocate engineers to projects with capacity tracking
- **Dashboard & Analytics**: Visual insights into team utilization and project progress

### Key Capabilities
- **Capacity Tracking**: Real-time monitoring of engineer workload and availability
- **Role-Based Access**: Different permissions for Managers and Engineers
- **Interactive Dashboard**: Charts and analytics for resource planning
- **Capacity Validation**: Prevents over-allocation of engineer resources
- **Project Timeline Management**: Track project duration and milestones

## Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with bcrypt for password hashing
- **Validation**: Express-validator for input validation
- **API**: RESTful API design

### Frontend
- **Framework**: React 18 with JavaScript
- **Styling**: Tailwind CSS for modern UI design
- **Charts**: Chart.js with react-chartjs-2 for analytics
- **Icons**: Heroicons for beautiful UI elements
- **HTTP Client**: Axios for API communication
- **Routing**: React Router for navigation

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone https://github.com/trickster26/geekyAnts_assesment.git
cd geetant_assignment
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Environment Setup
Create a `.env` file in the backend directory:
```bash
# backend/.env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=5000
NODE_ENV=development
```

### 4. Database Setup with Prisma

#### 4.1 Generate Prisma Client
```bash
cd backend
npx prisma generate
```

#### 4.2 Create and Apply Database Migrations
```bash
# Create the initial migration
npx prisma migrate dev --name init

# This will:
# - Create the SQLite database file (dev.db)
# - Apply all schema changes
# - Generate the Prisma client
```

#### 4.3 Seed the Database (Optional)
```bash
# Populate the database with demo data
npx prisma db seed
```

#### 4.4 View Database (Optional)
```bash
# Open Prisma Studio to view/edit data
npx prisma studio
```

#### 4.5 Reset Database (If needed)
```bash
# Reset database and reapply migrations
npx prisma migrate reset

# Alternative: Delete and recreate
rm prisma/dev.db
npx prisma migrate dev --name init
npx prisma db seed
```

#### 4.6 Database Schema Overview
The application uses the following main entities:
- **Users**: Authentication and role management (Manager/Engineer)
- **Projects**: Project information with status and priorities
- **Assignments**: Many-to-many relationship between Users and Projects
- **Capacity tracking**: Built into assignments with percentage allocation

#### 4.7 Troubleshooting Prisma Setup
**Common Issues:**

1. **"Environment variable not found: DATABASE_URL"**
   - Ensure `.env` file exists in the backend directory
   - Check that `DATABASE_URL="file:./dev.db"` is set

2. **"Prisma Client not found"**
   ```bash
   npx prisma generate
   ```

3. **Migration issues**
   ```bash
   # Reset and start fresh
   npx prisma migrate reset
   npx prisma migrate dev --name init
   ```

4. **Database locked error**
   - Close any database viewers (like DB Browser for SQLite)
   - Restart the backend server

5. **Schema changes not reflected**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name your_change_name
   ```

### 5. Start the Application
```bash
# From the root directory, start both backend and frontend
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend application on http://localhost:3000

## Usage

### Demo Credentials
The application includes demo accounts for testing:

**Manager Account:**
- Email: manager@demo.com
- Password: password123

**Engineer Account:**
- Email: engineer@demo.com
- Password: password123

### Getting Started
1. **Registration**: Create an account by choosing your role (Manager or Engineer)
2. **Dashboard**: View team utilization and project overview
3. **Projects**: Managers can create and manage projects
4. **Engineers**: View team members and their current workload
5. **Assignments**: Managers can assign engineers to projects with capacity validation

### Manager Workflow
1. Create projects with priority levels and timelines
2. View available engineers and their capacity
3. Assign engineers to projects while monitoring capacity limits
4. Track project progress and team utilization

### Engineer Workflow
1. View personal assignments and workload
2. See project details and priorities
3. Monitor team capacity and availability

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (Manager only)

### Users
- `GET /api/users` - Get all users

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment (Manager only)

### Dashboard
- `GET /api/dashboard/analytics` - Get dashboard analytics
- `GET /api/dashboard/workload` - Get team workload data

## AI Tools Usage Report

This project extensively utilized AI tools to accelerate development and ensure code quality:

### Primary AI Tool: Claude (Anthropic)
**Usage**: 95% of development assistance
**Contributions**:
- **Architecture Design**: Designed the full-stack architecture with proper separation of concerns
- **Database Schema**: Created comprehensive Prisma schema with relationships
- **Backend Development**: Implemented all API endpoints with proper validation and error handling
- **Frontend Components**: Built React components with modern hooks and state management
- **Authentication System**: Implemented JWT-based authentication with role-based access
- **UI/UX Design**: Created responsive design using Tailwind CSS
- **Code Optimization**: Optimized database queries and API performance
- **Documentation**: Generated comprehensive documentation and setup instructions

### Specific AI Contributions:
1. **Backend API Design**: AI helped design RESTful endpoints with proper HTTP status codes
2. **Database Relationships**: Designed complex relationships between Users, Projects, and Assignments
3. **Capacity Validation Logic**: Implemented sophisticated capacity checking algorithms
4. **React Components**: Created reusable, accessible components with proper error handling
5. **Authentication Flow**: Designed secure authentication with token refresh mechanisms
6. **Chart Integration**: Implemented interactive charts for analytics dashboard
7. **Responsive Design**: Created mobile-first responsive layouts
8. **Error Handling**: Comprehensive error handling throughout the application

### AI-Assisted Problem Solving:
- **Capacity Calculation**: AI helped implement complex capacity utilization calculations
- **Date Handling**: Proper date validation and formatting across the application
- **State Management**: Efficient React state management patterns
- **API Error Handling**: Robust error handling and user feedback systems

### Code Quality Improvements:
- **Type Safety**: Consistent data validation throughout the application
- **Security**: Implemented proper authentication and authorization
- **Performance**: Optimized database queries and React rendering
- **Accessibility**: Added proper ARIA labels and keyboard navigation

## Architecture Overview

### Backend Architecture
```
backend/
├── src/
│   ├── index.js          # Main server file
│   ├── middleware/       # Authentication middleware
│   ├── routes/          # API route handlers
│   └── prisma/          # Database schema and migrations
```

### Frontend Architecture
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Main application pages
│   ├── contexts/       # React context providers
│   └── utils/          # Utility functions and API client
```

## Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Different permissions for Managers and Engineers
- **Input Validation**: Comprehensive validation on all API endpoints
- **CORS Protection**: Proper cross-origin resource sharing configuration

## Performance Optimizations

- **Database Indexing**: Optimized database queries with proper indexing
- **API Efficiency**: Minimal API calls with comprehensive data fetching
- **React Optimization**: Proper use of useEffect and useState hooks
- **Lazy Loading**: Components loaded as needed
- **Caching**: Local storage for authentication tokens

## Deployment Considerations

### Environment Variables
- Set strong JWT secrets in production
- Configure database URLs for production databases
- Set proper CORS origins for production domains

### Database
- Migrate to PostgreSQL or MySQL for production
- Set up proper database backups
- Configure connection pooling

### Security
- Enable HTTPS in production
- Set up proper firewall rules
- Configure rate limiting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is developed as part of an assignment and is for educational purposes.

## Known Issues

- Database migrations need to be run manually in development
- Chart.js may need optimization for large datasets
- Mobile responsiveness can be improved for complex tables

## Support

For any issues or questions, please refer to the code comments or create an issue in the repository.

---

**Note**: This project demonstrates modern full-stack development practices with extensive use of AI tools for rapid development and code quality assurance. 
