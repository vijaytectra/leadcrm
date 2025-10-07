#!/bin/bash

# LEAD101 Development Setup Script
# This script helps set up the development environment

echo "🚀 Setting up LEAD101 Development Environment"
echo "==============================================="

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js version: $NODE_VERSION"
else
    echo "❌ Node.js is not installed. Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

# Check if npm is available
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm version: $NPM_VERSION"
else
    echo "❌ npm is not available"
    exit 1
fi

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Copy environment file
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please update .env file with your configuration"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo "Generating Prisma client..."
npm run prisma:generate

# Run migrations
echo "Running database migrations..."
npm run prisma:migrate

# Seed database
echo "Seeding database with test data..."
npm run seed

echo "✅ Backend setup completed!"

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd ../frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Copy environment file
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local file from .env.example"
    echo "⚠️  Please update .env.local file with your configuration"
else
    echo "✅ .env.local file already exists"
fi

echo "✅ Frontend setup completed!"

# Return to root directory
cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo "==============================================="
echo ""
echo "📋 Next Steps:"
echo "1. Update environment files with your configuration:"
echo "   - backend/.env"
echo "   - frontend/.env.local"
echo ""
echo "2. Start development servers:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000"
echo ""
echo "4. Test with these credentials:"
echo "   Super Admin: superadmin@lead101.com / SuperAdmin123!"
echo "   Demo School: admin@demoschool.com / Admin123!"
echo ""
echo "📚 Documentation: docs/ENVIRONMENT-SETUP.md"
echo "==============================================="
