# LEAD101 Development Setup Script
# This script helps set up the development environment

Write-Host "🚀 Setting up LEAD101 Development Environment" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 20+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ npm is not available" -ForegroundColor Red
    exit 1
}

# Setup Backend
Write-Host "`n📦 Setting up Backend..." -ForegroundColor Yellow
Set-Location "backend"

# Install dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
npm install

# Copy environment file
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
    Write-Host "⚠️  Please update .env file with your configuration" -ForegroundColor Yellow
}
else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
npm run prisma:generate

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Cyan
npm run prisma:migrate

# Seed database
Write-Host "Seeding database with test data..." -ForegroundColor Cyan
npm run seed

Write-Host "✅ Backend setup completed!" -ForegroundColor Green

# Setup Frontend
Write-Host "`n📦 Setting up Frontend..." -ForegroundColor Yellow
Set-Location "../frontend"

# Install dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
npm install

# Copy environment file
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local file from .env.example" -ForegroundColor Green
    Write-Host "⚠️  Please update .env.local file with your configuration" -ForegroundColor Yellow
}
else {
    Write-Host "✅ .env.local file already exists" -ForegroundColor Green
}

Write-Host "✅ Frontend setup completed!" -ForegroundColor Green

# Return to root directory
Set-Location ".."

Write-Host "`n🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update environment files with your configuration:"
Write-Host "   - backend/.env"
Write-Host "   - frontend/.env.local"
Write-Host "`n2. Start development servers:"
Write-Host "   Backend:  cd backend && npm run dev"
Write-Host "   Frontend: cd frontend && npm run dev"
Write-Host "`n3. Access the application:"
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend:  http://localhost:4000"
Write-Host "`n4. Test with these credentials:"
Write-Host "   Super Admin: superadmin@lead101.com / SuperAdmin123!"
Write-Host "   Demo School: admin@demoschool.com / Admin123!"
Write-Host "`n📚 Documentation: docs/ENVIRONMENT-SETUP.md"
Write-Host "===============================================" -ForegroundColor Green
