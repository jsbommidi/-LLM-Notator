# LLM Notator - Port Configuration

## Port Usage Overview

This document outlines all the ports used by the LLM Notator application. These ports have been specifically chosen to avoid conflicts with commonly used services.

## Application Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **Backend API** | `9847` | http://localhost:9847 | Go REST API server |
| **Frontend (Development)** | `5439` | http://localhost:5439 | Next.js development server |
| **Frontend (Production)** | `4628` | http://localhost:4628 | Next.js production server |

## Environment Variables

The following environment variables can be used to customize ports:

```bash
BACKEND_PORT=9847          # Backend server port
FRONTEND_PORT=5439         # Frontend development port
```

## Port Conflict Avoidance

These ports were chosen to avoid conflicts with commonly used services:

### Commonly Used Ports (Avoided)
- `3000` - React/Node.js development servers
- `3001` - Alternative React/Node.js servers
- `8000` - Python HTTP servers, Django development
- `8080` - HTTP proxy servers, Tomcat
- `5000` - Flask development servers
- `5432` - PostgreSQL database
- `3306` - MySQL database
- `6379` - Redis
- `27017` - MongoDB

### Our Selected Ports
- `9847` - Uncommon port, typically available
- `5439` - Uncommon port, typically available  
- `4628` - Uncommon port, typically available

## Checking Port Availability

Before starting the application, you can check if ports are available:

```bash
# Check if ports are in use
lsof -i :9847  # Backend
lsof -i :5439  # Frontend (dev)
lsof -i :4628  # Frontend (prod)

# Alternative check using netstat
netstat -tulpn | grep :9847
netstat -tulpn | grep :5439
netstat -tulpn | grep :4628
```

## Docker Compose Port Mapping

In `docker-compose.yml`, ports are mapped as follows:

```yaml
services:
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
3. **Health Check**: http://localhost:9847/health

## Firewall Configuration

If running in production, ensure these ports are allowed through your firewall:

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 9847/tcp
sudo ufw allow 5439/tcp
sudo ufw allow 4628/tcp

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=9847/tcp
sudo firewall-cmd --permanent --add-port=5439/tcp
sudo firewall-cmd --permanent --add-port=4628/tcp
sudo firewall-cmd --reload
``` 