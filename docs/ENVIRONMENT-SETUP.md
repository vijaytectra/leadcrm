# Environment Setup Guide

This guide will help you set up the development environment for LEAD101 CRM platform.

## Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- npm or yarn package manager
- Git ([Download](https://git-scm.com/))
- SQLite (for development) or PostgreSQL (for production)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/lead101.git
cd lead101
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
# See Backend Environment Variables section below

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with test data
npm run seed

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local file with your configuration
# See Frontend Environment Variables section below

# Start development server
npm run dev
```

## Environment Variables

### Backend Environment Variables (.env)

| Variable                 | Description                | Required | Default       | Example                         |
| ------------------------ | -------------------------- | -------- | ------------- | ------------------------------- |
| `NODE_ENV`               | Environment mode           | Yes      | `development` | `development`                   |
| `PORT`                   | Server port                | Yes      | `4000`        | `4000`                          |
| `DATABASE_URL`           | Database connection string | Yes      | -             | `file:./dev.db`                 |
| `JWT_SECRET`             | JWT signing secret         | Yes      | -             | `your_super_secret_jwt_key`     |
| `JWT_REFRESH_SECRET`     | JWT refresh secret         | Yes      | -             | `your_super_secret_refresh_key` |
| `SENDGRID_API_KEY`       | SendGrid API key           | Yes      | -             | `SG.xxx`                        |
| `CASHFREE_CLIENT_ID`     | Cashfree client ID         | Yes      | -             | `your_client_id`                |
| `CASHFREE_CLIENT_SECRET` | Cashfree client secret     | Yes      | -             | `your_client_secret`            |
| `CLOUDINARY_CLOUD_NAME`  | Cloudinary cloud name      | Yes      | -             | `your_cloud_name`               |
| `CLOUDINARY_API_KEY`     | Cloudinary API key         | Yes      | -             | `your_api_key`                  |
| `CLOUDINARY_API_SECRET`  | Cloudinary API secret      | Yes      | -             | `your_api_secret`               |

### Frontend Environment Variables (.env.local)

| Variable                            | Description           | Required | Default                 | Example                 |
| ----------------------------------- | --------------------- | -------- | ----------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL`               | Backend API URL       | Yes      | `http://localhost:4000` | `http://localhost:4000` |
| `NEXT_PUBLIC_APP_URL`               | Frontend URL          | Yes      | `http://localhost:3000` | `http://localhost:3000` |
| `NEXT_PUBLIC_CASHFREE_APP_ID`       | Cashfree app ID       | Yes      | -                       | `your_app_id`           |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes      | -                       | `your_cloud_name`       |

## Service Configuration

### 1. Database Setup

#### Development (SQLite)

```bash
# SQLite is included by default
# No additional setup required
```

#### Production (PostgreSQL)

```bash
# Install PostgreSQL
# Create database
createdb lead101

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://username:password@localhost:5432/lead101"
```

### 2. Email Service (SendGrid)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Add to `.env`:
   ```
   SENDGRID_API_KEY=SG.your_api_key_here
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=LEAD101 Platform
   ```

### 3. Payment Gateway (Cashfree)

1. Sign up at [Cashfree](https://www.cashfree.com/)
2. Get your credentials from the dashboard
3. Add to `.env`:
   ```
   CASHFREE_CLIENT_ID=your_client_id
   CASHFREE_CLIENT_SECRET=your_client_secret
   CASHFREE_MODE=sandbox
   ```

### 4. File Storage (Cloudinary)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the dashboard
3. Add to `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### 5. SMS Service (Twilio) - Optional

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your credentials
3. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_phone_number
   ```

## Test Credentials

After running the seed script, you can use these test credentials:

### Super Admin

- **Tenant:** `lead101`
- **Email:** `superadmin@lead101.com`
- **Password:** `SuperAdmin123!`

### Demo School Users

- **Tenant:** `demo-school`
- **Institution Admin:** `admin@demoschool.com` / `Admin123!`
- **Telecaller:** `telecaller@demoschool.com` / `Telecaller123!`
- **Document Verifier:** `verifier@demoschool.com` / `Verifier123!`
- **Finance Team:** `finance@demoschool.com` / `Finance123!`
- **Admission Team:** `admission@demoschool.com` / `Admission123!`
- **Admission Head:** `head@demoschool.com` / `Head123!`
- **Student:** `student@demoschool.com` / `Student123!`
- **Parent:** `parent@demoschool.com` / `Parent123!`

## Development Workflow

### 1. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Documentation:** http://localhost:4000/api-docs (if enabled)

### 3. Database Management

```bash
# View database in Prisma Studio
npm run prisma:studio

# Reset database
npm run prisma:migrate:reset

# Seed database
npm run seed
```

## Production Deployment

### Environment Variables for Production

Make sure to set these additional variables for production:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
CASHFREE_MODE=production
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=error
ENABLE_DEBUG_MODE=false
```

### Security Checklist

- [ ] Use strong, unique JWT secrets
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Use environment-specific database URLs
- [ ] Enable security headers

## Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Check DATABASE_URL format
   - Ensure database server is running
   - Run migrations: `npm run prisma:migrate`

2. **JWT Token Error**

   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Clear browser storage and re-login

3. **Email Not Sending**

   - Verify SendGrid API key
   - Check email template configuration
   - Test with SendGrid dashboard

4. **Payment Integration Issues**
   - Verify Cashfree credentials
   - Check webhook configuration
   - Test in sandbox mode first

### Getting Help

- Check the [API Documentation](http://localhost:4000/api-docs)
- Review the [Project README](../README.md)
- Check [GitHub Issues](https://github.com/yourusername/lead101/issues)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Cashfree Documentation](https://docs.cashfree.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
