# LLM Notator

A comprehensive tool for reviewing and annotating LLM input-output pairs with archive functionality.

## Features

- **Interactive Annotation Interface**: Review prompts and responses with error categorization
- **LLM Integration**: Generate new examples using local LLMs (Ollama, LM Studio)
- **Archive System**: Save annotations to PostgreSQL database with search functionality
- **Real-time Status Indicators**: Visual feedback during LLM request processing
- **Flexible Data Sources**: Support for files, URLs, and API endpoints
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

The system consists of three main components:

1. **Frontend** (Next.js) - User interface for annotation and archive viewing
2. **Backend** (Go) - API server for managing examples and annotations  
3. **Database Worker** (Node.js) - PostgreSQL integration for archive functionality

## Quick Start

### Prerequisites

- Node.js 16+
- Go 1.19+
- PostgreSQL 13+
- Docker & Docker Compose (optional)

### Using Docker Compose

```bash
docker-compose up
```

This will start all services:
- Frontend: http://localhost:5439
- Backend: http://localhost:9847  
- Database Worker: http://localhost:9848

### Manual Setup

#### 1. Database Setup

Create PostgreSQL database:
```bash
createdb llm_notator
```

#### 2. Database Worker

```bash
cd db-worker
npm install

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5435
DB_NAME=llm_notator
DB_USER=postgres
DB_PASSWORD=postgres
PORT=9848
EOF

# Start the worker
npm start
```

#### 3. Backend

```bash
cd backend
go mod download
go run main.go
```

#### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Usage

### Basic Annotation Workflow

1. **Load Examples**: Examples are loaded from your configured data source
2. **Review Content**: Examine the prompt and response pairs
3. **Categorize Errors**: Select relevant error categories
4. **Add Notes**: Provide detailed feedback
5. **Submit**: Choose between regular submission or archiving to database

### LLM Integration

1. **Configure LLM**: Go to Settings → LLM Integration
2. **Choose Provider**: Select Ollama or LM Studio
3. **Set Connection**: Configure base URL and model name
4. **Generate Examples**: Use the LLM Generator on the main page

### Archive Management

1. **Access Archive**: Click "📚 Archive" button in navigation
2. **Search**: Use the search bar to find specific annotations
3. **View Details**: Click "👁️ View Details" for full annotation information
4. **Manage**: Delete archives as needed

### Status Indicators

The system provides real-time feedback during LLM requests:

- **📤 Sending prompt**: Request is being sent to LLM
- **⏳ Waiting for LLM response**: Waiting for model to generate response
- **⚙️ Processing response**: Processing and formatting the response

## API Endpoints

### Backend (Port 9847)
- `GET /health` - Health check
- `GET /examples` - Get examples
- `POST /annotations` - Submit annotation

### Database Worker (Port 9848)
- `GET /health` - Health check
- `GET /archives` - Get archived annotations with pagination
- `POST /archives` - Create new archive
- `GET /archives/:id` - Get specific archive
- `PUT /archives/:id` - Update archive
- `DELETE /archives/:id` - Delete archive
- `GET /archives/search/:query` - Search archives

## Configuration

### Environment Variables

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:9847
NEXT_PUBLIC_ARCHIVE_API_URL=http://localhost:9848
```

**Database Worker** (`.env`):
```
DB_HOST=localhost
DB_PORT=5435  # Use 5435 for host connections, 5432 for Docker internal
DB_NAME=llm_notator
DB_USER=postgres
DB_PASSWORD=postgres
PORT=9848
```

### Settings

Configure the application through the Settings page:

- **Data Sources**: File, URL, or API endpoints for examples
- **LLM Integration**: Local LLM providers (Ollama, LM Studio)  
- **Auto-refresh**: Automatic data reloading
- **Theme**: Light, dark, or auto themes

## Database Schema

### Archives Table
```sql
CREATE TABLE archives (
  id SERIAL PRIMARY KEY,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  error_categories JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Development

### Project Structure

```
LLM Notator/
├── frontend/          # Next.js frontend application
├── backend/           # Go backend API server
├── db-worker/         # Node.js PostgreSQL worker
├── data/              # Sample data files
└── docker-compose.yml # Docker orchestration
```

### Key Features Implemented

- ✅ Export functionality removed
- ✅ PostgreSQL archive system created
- ✅ Database worker on port 9848
- ✅ Archive page with search and pagination
- ✅ Enhanced LLM status indicators
- ✅ Archive button in annotation interface

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l | grep llm_notator`

### LLM Integration Issues  
- Verify LLM service is running (Ollama/LM Studio)
- Check connection settings in UI
- Test connection using the status button

### Port Conflicts
- Frontend: 5439 (configurable)
- Backend: 9847 (configurable)  
- Database Worker: 9848 (configurable)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 