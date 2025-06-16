# LLM Notator - Application Information

This document provides comprehensive information about launching, testing, and working with the LLM Notator web application.

## Application Overview

**LLM Notator** is a Dockerized web application for reviewing, tagging, and exporting annotations of LLM input-output pairs. It consists of:
- **Backend**: Gin (Go) REST API
- **Frontend**: Next.js (React) with TypeScript
- **Data Storage**: JSON Lines input, CSV annotation output
- **Containerization**: Docker + docker-compose

## Port Configuration

### Default Ports
| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **Frontend** | `3001` | http://localhost:3001 | Main web interface |
| **Backend API** | `8000` | http://localhost:8000 | REST API endpoints |
| **LLM API** | `11434` | http://localhost:11434 | Ollama default port |
| **LM Studio** | `1234` | http://localhost:1234 | LM Studio default port |

### Environment Variables for Port Configuration
```bash
BACKEND_PORT=8000          # Backend server port
FRONTEND_PORT=3001         # Frontend development port (3000 in production)
LLM_API_URL=http://localhost:11434  # LLM service endpoint
```

## Launch Commands

### 🚀 Production Deployment (Recommended)

#### Using Docker Compose
```bash
# Build and start all services
docker compose up --build

# Start in detached mode (background)
docker compose up --build -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

#### Using Makefile (Easier)
```bash
# Start application
make up

# View logs
make logs

# Stop application
make down

# Clean up containers and images
make clean
```

### 🛠️ Development Mode

#### Backend Development
```bash
# Install dependencies
cd backend
go mod tidy

# Run backend server
make dev-backend
# OR
cd backend && go run main.go

# Backend will be available at: http://localhost:8000
```

#### Frontend Development
```bash
# Install dependencies
cd frontend
npm install

# Run frontend development server
make dev-frontend
# OR
cd frontend && npm run dev

# Frontend will be available at: http://localhost:3001
```

#### Full Development Setup
```bash
# Terminal 1: Start backend
make dev-backend

# Terminal 2: Start frontend
make dev-frontend

# Both services will auto-reload on file changes
```

## API Endpoints

### Backend REST API (Port 8000)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/health` | Health check | None | `{"status": "healthy"}` |
| `GET` | `/examples` | Get all examples | None | Array of examples |
| `POST` | `/annotations` | Submit annotation | `{"id": string, "labels": string[], "notes": string}` | Success message |
| `GET` | `/export` | Download annotations CSV | None | CSV file download |

#### Example API Calls
```bash
# Health check
curl http://localhost:8000/health

# Get examples
curl http://localhost:8000/examples

# Submit annotation
curl -X POST http://localhost:8000/annotations \
  -H "Content-Type: application/json" \
  -d '{"id": "1", "labels": ["accuracy", "helpfulness"], "notes": "Good response"}'

# Export annotations
curl -O http://localhost:8000/export
```

### Frontend Routes (Port 3001)

| Route | Description |
|-------|-------------|
| `/` | Main annotation interface |
| `/api/health` | Frontend health check |

## Testing the Application

### 1. Quick Smoke Test
```bash
# Start the application
make up

# Wait for services to be ready (30-60 seconds)
# Check logs
make logs

# Test frontend (should show annotation interface)
open http://localhost:3001

# Test backend API
curl http://localhost:8000/health
```

### 2. Full Functionality Test

#### Frontend Testing
1. **Access Application**: Navigate to http://localhost:3001
2. **View Examples**: Should display first example with prompt and response
3. **Navigation**: Test Previous/Next buttons
4. **Annotation Form**: 
   - Select error categories from dropdown
   - Add notes in text area
   - Submit annotation
5. **Export**: Click "Export Annotations" button to download CSV

#### Backend Testing
```bash
# Test all endpoints
curl http://localhost:8000/health
curl http://localhost:8000/examples
curl -X POST http://localhost:8000/annotations \
  -H "Content-Type: application/json" \
  -d '{"id": "1", "labels": ["accuracy"], "notes": "Test annotation"}'
curl -O http://localhost:8000/export
```

### 3. Load Testing
```bash
# Test multiple concurrent requests
for i in {1..10}; do
  curl http://localhost:8000/examples &
done
wait
```

## Data Management

### Input Data Format (`data/examples.jsonl`)
```json
{"id": "1", "prompt": "What is the capital of France?", "response": "Paris is the capital..."}
{"id": "2", "prompt": "Explain quantum computing", "response": "Quantum computing uses..."}
```

### Annotation Output Format (`data/annotations.csv`)
```csv
id,labels,notes,timestamp
1,"accuracy,helpfulness","Good response",2024-01-01T10:00:00Z
2,"clarity","Could be more detailed",2024-01-01T10:05:00Z
```

### Adding New Examples
1. Edit `data/examples.jsonl`
2. Add new lines in JSON format
3. Restart the application: `make down && make up`

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :8000  # for backend
lsof -i :3001  # for frontend

# Kill process if needed
kill -9 <PID>

# Or use different ports
BACKEND_PORT=8080 FRONTEND_PORT=3002 make up
```

#### Docker Issues
```bash
# Clean up Docker resources
make clean

# Rebuild everything from scratch
docker system prune -f
make up
```

#### Backend Connection Issues
```bash
# Check backend logs
docker compose logs llm-notator-backend

# Test backend directly
curl http://localhost:8000/health

# Check if backend container is running
docker compose ps
```

#### Frontend Build Issues
```bash
# Check frontend logs
docker compose logs llm-notator-frontend

# Clear Next.js cache
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

### Health Checks

#### Automated Health Checks
```bash
# Check if services are healthy
docker compose ps

# Frontend health
curl http://localhost:3001/api/health

# Backend health
curl http://localhost:8000/health
```

#### Manual Health Checks
1. **Backend**: API responds to `/health` endpoint
2. **Frontend**: Web interface loads without errors
3. **Data Flow**: Can view examples and submit annotations
4. **Export**: Can download annotations CSV

## Performance Considerations

### Resource Usage
- **Backend**: ~50MB RAM, minimal CPU
- **Frontend**: ~100MB RAM during build, ~50MB runtime
- **Total**: ~150MB RAM for full stack

### Optimization Tips
```bash
# Production build with optimizations
docker compose build --no-cache

# Limit container resources
# Add to docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 256M
      cpus: '0.5'
```

## Environment Setup

### Development Environment
```bash
# Install development dependencies
make install-backend
make install-frontend

# Set up environment variables
export BACKEND_PORT=8000
export FRONTEND_PORT=3001
export LLM_API_URL=http://localhost:11434
```

### Production Environment
```bash
# Set production environment variables
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=http://your-domain.com:8000

# Deploy with production settings
docker compose -f docker-compose.yml up -d
```

## Integration with LLM Services

### Ollama Integration
```bash
# Start Ollama (if not running)
ollama serve

# Verify Ollama is accessible
curl http://localhost:11434/api/version

# Set environment variable
export LLM_API_URL=http://localhost:11434
```

### LM Studio Integration
```bash
# Start LM Studio server
# Set environment variable
export LLM_API_URL=http://localhost:1234
```

## Backup and Data Management

### Backup Annotations
```bash
# Backup current annotations
cp data/annotations.csv data/annotations_backup_$(date +%Y%m%d).csv

# Export via API
curl -O http://localhost:8000/export
```

### Data Migration
```bash
# To migrate data to new instance:
# 1. Copy data directory
cp -r data/ /new/location/

# 2. Update docker-compose.yml volume mapping
# 3. Restart application
```

## Monitoring and Logs

### View Application Logs
```bash
# All services
make logs

# Specific service
docker compose logs llm-notator-backend
docker compose logs llm-notator-frontend

# Follow logs in real-time
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100
```

### Application Metrics
```bash
# Container stats
docker stats

# Service status
docker compose ps

# System resource usage
docker system df
```

---

## Quick Reference Commands

| Action | Command |
|--------|---------|
| **Start App** | `make up` |
| **Stop App** | `make down` |
| **View Logs** | `make logs` |
| **Clean Up** | `make clean` |
| **Dev Backend** | `make dev-backend` |
| **Dev Frontend** | `make dev-frontend` |
| **Health Check** | `curl http://localhost:8000/health` |
| **View App** | `open http://localhost:3001` |

**Happy Annotating! 🚀** 