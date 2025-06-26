# LLM Notator - Port Configuration

## Port Usage Overview

This document outlines all the ports used by the LLM Notator application. These ports have been specifically chosen to avoid conflicts with commonly used services.

## Application Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **PostgreSQL Database** | `5435` | postgresql://localhost:5435 | PostgreSQL database server |
| **Database Worker** | `9848` | http://localhost:9848 | Node.js archive/database API |
| **Backend API** | `9847` | http://localhost:9847 | Go REST API server |
| **Frontend (Development)** | `5439` | http://localhost:5439 | Next.js development server |
| **Frontend (Production)** | `4628` | http://localhost:4628 | Next.js production server |

## Environment Variables

The following environment variables can be used to customize ports:

```bash
DB_PORT=5435               # PostgreSQL database port
BACKEND_PORT=9847          # Backend server port
FRONTEND_PORT=5439         # Frontend development port
DB_WORKER_PORT=9848        # Database worker service port
```

## Port Conflict Avoidance

These ports were chosen to avoid conflicts with commonly used services:

### Commonly Used Ports (Avoided)
- `3000` - React/Node.js development servers
- `3001` - Alternative React/Node.js servers
- `8000` - Python HTTP servers, Django development
- `8080` - HTTP proxy servers, Tomcat
- `5000` - Flask development servers
- `5432` - Default PostgreSQL database port
- `3306` - MySQL database
- `6379` - Redis
- `27017` - MongoDB

### Our Selected Ports
- `5435` - Custom PostgreSQL port (avoiding default 5432)
- `9848` - Database worker service port
- `9847` - Backend API server port
- `5439` - Frontend development server port
- `4628` - Frontend production server port

## Checking Port Availability

Before starting the application, you can check if ports are available:

```bash
# Check if ports are in use
lsof -i :5435  # PostgreSQL database
lsof -i :9848  # Database worker
lsof -i :9847  # Backend API
lsof -i :5439  # Frontend (dev)
lsof -i :4628  # Frontend (prod)

# Alternative check using netstat
netstat -tulpn | grep :5435
netstat -tulpn | grep :9848
netstat -tulpn | grep :9847
netstat -tulpn | grep :5439
netstat -tulpn | grep :4628
```

## Docker Compose Port Mapping

In `docker-compose.yml`, ports are mapped as follows:

```yaml
services:
  postgres:
    ports:
      - "5435:5435"  # External:Internal (same port)
  
  db-worker:
    ports:
      - "9848:9848"
  
  llm-notator-backend:
    ports:
      - "${BACKEND_PORT:-9847}:9847"
  
  llm-notator-frontend:
    ports:
      - "${FRONTEND_PORT:-5439}:4628"
```

## Development vs Production

- **Development**: Frontend runs on port `5439` using `npm run dev`
- **Production**: Frontend runs on port `4628` using `npm start`
- **Backend**: Always runs on port `9847` in both environments

## Accessing the Application

After starting the application:

1. **Frontend (UI)**: http://localhost:5439 (development) or http://localhost:4628 (production)
2. **Backend API**: http://localhost:9847
3. **Database Worker API**: http://localhost:9848
4. **PostgreSQL Database**: postgresql://localhost:5435
5. **Health Checks**: 
   - Backend: http://localhost:9847/health
   - Database Worker: http://localhost:9848/health

## Firewall Configuration

If running in production, ensure these ports are allowed through your firewall:

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 5435/tcp  # PostgreSQL
sudo ufw allow 9848/tcp  # Database worker
sudo ufw allow 9847/tcp  # Backend API
sudo ufw allow 5439/tcp  # Frontend (dev)
sudo ufw allow 4628/tcp  # Frontend (prod)

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=5435/tcp
sudo firewall-cmd --permanent --add-port=9848/tcp
sudo firewall-cmd --permanent --add-port=9847/tcp
sudo firewall-cmd --permanent --add-port=5439/tcp
sudo firewall-cmd --permanent --add-port=4628/tcp
sudo firewall-cmd --reload
```

## External Service Dependencies

The application also connects to external LLM services:

| Service | Default Port | URL | Purpose |
|---------|-------------|-----|---------|
| **Ollama** | `11434` | http://localhost:11434 | Local LLM inference |
| **LM Studio** | `1234` | http://localhost:1234 | Local LLM inference |

These services are optional and run independently. Configure them in the application settings.

## Complete Port Summary

**Internal Application Ports:**
- `5435` - PostgreSQL Database
- `9848` - Database Worker (Archive API)
- `9847` - Backend API
- `5439` - Frontend Development Server
- `4628` - Frontend Production Server

**External LLM Services:**
- `11434` - Ollama (optional)
- `1234` - LM Studio (optional)

## Database Connection

The PostgreSQL database is accessible at different ports depending on the connection source:

### From Host Machine (External):
- **Host**: `localhost`
- **Port**: `5435`
- **Database**: `llm_notator`
- **Username**: `postgres`
- **Password**: `postgres`
- **Connection string**: `postgresql://postgres:postgres@localhost:5435/llm_notator`

### From Docker Containers (Internal):
- **Host**: `postgres` (container name)
- **Port**: `5435` (same as external)
- **Database**: `llm_notator`
- **Username**: `postgres`
- **Password**: `postgres`
- **Connection string**: `postgresql://postgres:postgres@postgres:5435/llm_notator`

**Important**: The Docker port mapping `5435:5435` means:
- Both external and internal applications connect to port `5435`
- This avoids any confusion with other PostgreSQL containers using the default port 5432 