# 🐳 AIPharm+ Docker Setup

Complete containerized setup for AIPharm+ with Docker Compose.

## 🚀 Quick Start

### Prerequisites
- **Docker Desktop** installed on Windows 11
- **Git** (to clone the project)

### 1. Clone & Run
```bash
# Clone the project
git clone <your-repo-url>
cd AIPharm

# Start everything with one command
docker-compose up
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger
- **Database**: localhost:1433 (sa/YOURPASSWORD)

## 🏗️ Architecture

### Services
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   React + Vite  │───▶│   .NET 8 API    │───▶│  SQL Server     │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 1433    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Docker Containers
- **aipharm-frontend** - React application
- **aipharm-backend** - .NET 8 Web API
- **aipharm-database** - SQL Server 2022

## 📋 Available Commands

### Start Services
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Start specific service
docker-compose up frontend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Follow logs
docker-compose logs -f backend
```

### Rebuild Services
```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild and start
docker-compose up --build
```

## 🔧 Development

### Hot Reload
- **Frontend**: ✅ Automatic (Vite hot reload)
- **Backend**: ❌ Requires rebuild (`docker-compose build backend`)

### Making Changes

#### Frontend Changes
```bash
# Changes in src/ are automatically reflected
# No rebuild needed
```

#### Backend Changes
```bash
# After changing C# code:
docker-compose build backend
docker-compose up backend
```

### Database Access
```bash
# Connect to SQL Server
docker exec -it aipharm-database /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YOURPASSWORD
```

## 🎯 Default Account

### Login Credentials
- **Admin**: aipharmplus@outlook.com / Admin123!

Registration confirmations and 2FA emails are dispatched via the Outlook mailbox `aipharmplus@outlook.com`. In the Docker development profile each message is also written to `AIPharm.Backend/AIPharm.Web/App_Data/Emails`, so you can open the `.eml` files locally to view one-time codes for any seeded account.

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Kill the process
taskkill /PID <PID> /F
```

#### Database Connection Issues
```bash
# Check database health
docker-compose ps
docker-compose logs database

# Restart database
docker-compose restart database
```

#### Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up frontend
```

#### Backend API Errors
```bash
# Check backend logs
docker-compose logs backend

# Check database connection
docker-compose exec backend curl http://localhost:8080/api/health
```

### Reset Everything
```bash
# Nuclear option - reset everything
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## 📊 Container Status

### Check Running Containers
```bash
docker ps
```

### Container Resource Usage
```bash
docker stats
```

### Container Shell Access
```bash
# Backend container
docker exec -it aipharm-backend bash

# Frontend container
docker exec -it aipharm-frontend sh

# Database container
docker exec -it aipharm-database bash
```

## 🚀 Production Deployment

### Environment Variables
Create `.env` file:
```env
# Database
SA_PASSWORD=YourStrongPassword123!

# JWT
JWT_KEY=YourSuperSecretJWTKey

# API URL
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Production Docker Compose
```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Notes

- **Database data** persists in Docker volume `sqlserver_data`
- **First startup** takes longer (downloading images, database setup)
- **Hot reload** works for frontend, backend needs rebuild
- **Swagger** is available in all environments for API testing

## 🎉 Success!

If you see:
- Frontend at http://localhost:3000
- Backend at http://localhost:8080/swagger
- No errors in logs

You're ready to develop! 🚀

---

**Happy Coding with Docker!** 🐳💊