# LEAD101 - Educational CRM Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

> A comprehensive multi-tenant SaaS CRM platform designed specifically for educational institutions to streamline lead management from advertising campaigns to student enrollment.

## 🎯 Project Overview

LEAD101 transforms how educational institutions acquire and convert students by providing an intelligent, automated, and comprehensive CRM solution that bridges the gap between marketing efforts and enrollment success.

### 🌟 Key Features

- **🏢 Multi-Tenant Architecture** - Secure, scalable SaaS platform
- **📝 Dynamic Form Builder** - Drag-and-drop forms with conditional logic
- **💰 Integrated Payments** - Cashfree payment gateway with fee splitting
- **📊 Lead Scoring & Management** - AI-powered lead qualification and assignment
- **👥 Role-Based Workflows** - Specialized modules for different team roles
- **📱 Student/Parent Portal** - Real-time application tracking and payments
- **🔗 Multi-Channel Integration** - Google Ads, Meta, LinkedIn integrations
- **📈 Advanced Analytics** - Comprehensive reporting and insights

### 🎭 User Roles

| Role | Description | Key Features |
|------|-------------|--------------|
| **Super Admin** | Platform owner | Institution management, subscription billing, platform analytics |
| **Institution Admin** | School/college administrator | Team management, form builder, integrations setup |
| **Telecaller** | Lead contact specialist | Lead assignment, call logging, communication tools |
| **Document Verifier** | Document validation | Document review, verification workflows |
| **Finance Team** | Fee management | Fee structures, payment processing, refunds |
| **Admission Team** | Admission counseling | Application review, counseling sessions |
| **Admission Head** | Final decisions | Bulk approvals, offer letter generation |
| **Student/Parent** | End users | Application tracking, payments, communication |

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS + ShadCN UI
- **State Management:** Zustand + React Query
- **Forms:** React Hook Form + Zod validation
- **Testing:** Jest + React Testing Library + Playwright

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript (Strict mode)
- **Database:** Prisma ORM (SQLite dev, PostgreSQL prod)
- **Authentication:** JWT + bcrypt
- **Validation:** Zod
- **Email:** SendGrid
- **Testing:** Jest + Supertest

### Infrastructure
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render.com
- **Database:** PostgreSQL (Render/Supabase)
- **Payments:** Cashfree Gateway
- **Monitoring:** Sentry + Uptime Robot
- **CDN:** Cloudflare

### Development Tools
- **IDE:** Cursor AI (Pro Plan)
- **Version Control:** GitHub
- **CI/CD:** GitHub Actions
- **Containerization:** Docker
- **Documentation:** Markdown + OpenAPI/Swagger

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 20+ ([Download](https://nodejs.org/))
- npm or yarn package manager
- Git ([Download](https://git-scm.com/))
- Docker (optional, for containerized development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lead101.git
   cd lead101
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Frontend environment
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with your configuration
   
   # Backend environment
   cd ../backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   cd backend
   
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # Seed the database (optional)
   npm run seed
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Backend server
   cd backend
   npm run dev
   
   # Terminal 2: Frontend server
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api-docs

---

## 📁 Project Structure

```
lead101/
├── frontend/                   # Next.js frontend application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # Reusable UI components
│   │   ├── lib/              # Utility functions and configurations
│   │   ├── hooks/            # Custom React hooks
│   │   ├── stores/           # Zustand state stores
│   │   └── types/            # TypeScript type definitions
│   ├── public/               # Static assets
│   └── package.json
│
├── backend/                   # Express.js backend application
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── controllers/      # Business logic controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── services/         # Business logic services
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # TypeScript type definitions
│   │   └── app.ts            # Express app configuration
│   ├── prisma/               # Database schema and migrations
│   └── package.json
│
├── docs/                      # Project documentation
│   ├── PRD.md                # Project Requirements Document
│   ├── Tasks.md              # Detailed task breakdown
│   ├── plan.md               # Development plan and timeline
│   └── api/                  # API documentation
│
├── docker-compose.yml         # Docker development environment
├── .github/                   # GitHub Actions workflows
└── README.md                  # This file
```

---

## 🔧 Development Workflow

### Using Cursor AI IDE

This project is optimized for development with Cursor AI. Here's how to maximize productivity:

1. **Install Cursor AI**
   - Download from [cursor.com](https://cursor.com)
   - Sign up for Cursor Pro plan for advanced features

2. **Project Setup in Cursor**
   ```bash
   # Open project in Cursor
   cursor .
   
   # Cursor will automatically detect the project structure
   # and load the .cursorrules configuration
   ```

3. **AI Model Selection Guide**
   - **GPT-4o Mini:** Simple tasks, documentation, basic components
   - **GPT-4o:** General development, business logic, most features
   - **Claude 3.5 Sonnet:** Complex logic, advanced features, refactoring
   - **Claude 3.5 Opus:** Critical systems, security implementations
   - **GPT-o1:** Architecture decisions, complex debugging

4. **Daily Development Workflow**
   ```bash
   # 1. Start your day by reviewing tasks
   # Check Tasks.md for today's priorities
   
   # 2. Use AI for planning
   # Ask Cursor AI to create implementation plans
   
   # 3. Develop with AI assistance
   # Use tab completion and chat for coding help
   
   # 4. Test and review
   npm run test
   npm run lint
   
   # 5. Commit and push
   git add .
   git commit -m "feat: implement feature X"
   git push
   ```

### Code Quality Standards

- **TypeScript:** Strict mode enabled, no `any` types
- **ESLint:** Enforced code style and best practices
- **Prettier:** Automatic code formatting
- **Testing:** Minimum 90% coverage for critical paths
- **Documentation:** Every function and module documented

---

## 🧪 Testing Strategy

### Running Tests

```bash
# Frontend tests
cd frontend
npm run test              # Run unit tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:e2e          # End-to-end tests

# Backend tests
cd backend
npm run test              # Run unit tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:integration  # Integration tests
```

### Test Types

| Test Type | Tool | Coverage |
|-----------|------|----------|
| **Unit Tests** | Jest | Individual functions and components |
| **Integration Tests** | Supertest | API endpoints and workflows |
| **E2E Tests** | Playwright | Complete user journeys |
| **Performance Tests** | k6 | Load testing and benchmarks |

---

## 🚀 Deployment

### Development Deployment

```bash
# Build the applications
cd frontend && npm run build
cd backend && npm run build

# Deploy to staging
npm run deploy:staging
```

### Production Deployment

The application is configured for deployment on:

- **Frontend:** Vercel (automatic deployment from main branch)
- **Backend:** Render.com (automatic deployment from main branch)
- **Database:** PostgreSQL on Render.com or Supabase

**Environment Variables Required:**

Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
```

Backend (.env):
```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_super_secret_jwt_key
SENDGRID_API_KEY=your_sendgrid_api_key
CASHFREE_CLIENT_ID=your_cashfree_client_id
CASHFREE_CLIENT_SECRET=your_cashfree_client_secret
```

---

## 📊 API Documentation

### Core Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/auth/login` | POST | User authentication | None |
| `/api/auth/refresh` | POST | Token refresh | Bearer token |
| `/api/users` | GET/POST | User management | Bearer token |
| `/api/institutions` | GET/POST | Institution management | Bearer token |
| `/api/leads` | GET/POST | Lead management | Bearer token |
| `/api/forms` | GET/POST | Form builder | Bearer token |
| `/api/payments` | POST | Payment processing | Bearer token |

### API Response Format

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "timestamp": "2025-10-06T12:00:00Z"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      // Error details
    }
  },
  "timestamp": "2025-10-06T12:00:00Z"
}
```

---

## 🔐 Security

### Security Features

- **Authentication:** JWT-based with refresh tokens
- **Authorization:** Role-based access control (RBAC)
- **Data Protection:** Encryption at rest and in transit
- **Multi-tenancy:** Row-level security for data isolation
- **Input Validation:** Comprehensive validation with Zod
- **Rate Limiting:** API rate limiting and DDoS protection

### Security Best Practices

1. **Environment Variables:** Never commit secrets to version control
2. **HTTPS:** Always use HTTPS in production
3. **Regular Updates:** Keep dependencies updated
4. **Security Audits:** Regular security reviews and penetration testing
5. **Monitoring:** Real-time security monitoring and alerting

---

## 🤝 Contributing

### Development Guidelines

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Follow coding standards**
   - Use TypeScript strict mode
   - Follow ESLint rules
   - Write tests for new features
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

---

## 📋 Project Roadmap

### ✅ Phase 1: Foundation (Months 1-2)
- [x] Project setup and configuration
- [x] Authentication and user management
- [x] Multi-tenant architecture
- [x] Super admin module

### 🔄 Phase 2: Core Features (Months 3-4)
- [ ] Lead management system
- [ ] Form builder with conditional logic
- [ ] Payment integration
- [ ] Multi-channel lead capture

### 📅 Phase 3: Team Modules (Months 5-6)
- [ ] Telecaller module
- [ ] Document verification
- [ ] Finance module
- [ ] Communication system

### 📅 Phase 4: Advanced Features (Months 7-8)
- [ ] Admission management
- [ ] Student/parent portal
- [ ] Advanced analytics
- [ ] Mobile optimization

### 📅 Phase 5: Launch Preparation (Months 9-12)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Production deployment

---

## 📞 Support

### Getting Help

- **Documentation:** Check the [docs](./docs/) folder for detailed guides
- **Issues:** Report bugs and request features via [GitHub Issues](https://github.com/yourusername/lead101/issues)
- **Discussions:** Join community discussions via [GitHub Discussions](https://github.com/yourusername/lead101/discussions)

### Development Support

- **AI Assistance:** Use Cursor AI for coding help and problem-solving
- **Code Reviews:** Request reviews for complex implementations
- **Architecture Decisions:** Consult with senior developers for major changes

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Cursor AI** - For revolutionary AI-assisted development experience
- **Next.js Team** - For the excellent React framework
- **Prisma Team** - For the best-in-class ORM
- **ShadCN** - For beautiful and accessible UI components
- **Vercel** - For seamless frontend deployment
- **Render.com** - For reliable backend hosting

---

## 📈 Project Status

**Current Phase:** Phase 1 - Foundation  
**Progress:** 0% Complete  
**Timeline:** On Track  
**Next Milestone:** Authentication System Complete  

**Quick Stats:**
- **Total Estimated Hours:** 847 hours
- **Development Timeline:** 12 months
- **Total Tasks:** 125 tasks
- **Technology Stack:** 15+ technologies

---

**Built with ❤️ by a solo developer using AI assistance**

*"Transforming education through intelligent technology"*