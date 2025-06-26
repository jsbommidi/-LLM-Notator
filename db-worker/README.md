# LLM Notator Database Worker

This is the database worker service for LLM Notator that handles archive functionality using PostgreSQL.

## Setup

### 1. Install Dependencies
```bash
cd db-worker
npm install
```

### 2. Setup PostgreSQL Database
Make sure PostgreSQL is installed and running, then create the database:
```bash
createdb llm_notator
```

### 3. Environment Configuration
Create a `.env` file (copy from `.env.example`):
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5435  # External port when connecting from host
DB_NAME=llm_notator
DB_USER=postgres
DB_PASSWORD=postgres

# Server Configuration
PORT=9848

# Note: When running in Docker, DB_PORT should be 5432 (internal port)
# When connecting from host machine, use 5435 (external mapped port)
```

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on port 9848 and automatically create the required database tables.

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Archives
- `GET /archives` - Get all archives with pagination
- `GET /archives/:id` - Get specific archive by ID
- `POST /archives` - Create new archive
- `PUT /archives/:id` - Update existing archive
- `DELETE /archives/:id` - Delete archive
- `GET /archives/search/:query` - Search archives

### Request/Response Examples

#### Create Archive
```bash
POST /archives
Content-Type: application/json

{
  "prompt": "What is the capital of France?",
  "response": "Paris is the capital of France.",
  "error_categories": ["factual_accuracy", "completeness"],
  "notes": "Response is accurate and complete."
}
```

#### Get Archives (with pagination)
```bash
GET /archives?page=1&limit=20
```

## Database Schema

### archives table
- `id` (SERIAL PRIMARY KEY)
- `prompt` (TEXT NOT NULL)
- `response` (TEXT NOT NULL) 
- `error_categories` (JSONB DEFAULT '[]')
- `notes` (TEXT DEFAULT '')
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE) 