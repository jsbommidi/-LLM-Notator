# LLM Notator

A Dockerized web app for reviewing, tagging, and exporting annotations of LLM input–output pairs via a Gin backend and Next.js frontend.

## Features

- **Backend**: Gin (Go) REST API for managing examples and annotations
- **Frontend**: Next.js (React) with TypeScript for annotation interface
- **Containerization**: Docker + docker-compose for easy deployment
- **LLM Integration**: Runtime connection to Ollama or LM Studio REST APIs
- **Data Management**: JSON Lines input format with CSV annotation export

## Quick Start

1. Clone the repository
2. Run the application with Docker Compose:

```bash
docker compose up --build
```

Or use the provided Makefile:

```bash
make up
```

3. Access the UI at `http://localhost:3001`

## Available Commands

Run `make help` to see all available commands:

```bash
make help          # Show help
make up            # Start the application
make down          # Stop the application
make logs          # View logs
make clean         # Clean up containers
make dev-backend   # Run backend in dev mode
make dev-frontend  # Run frontend in dev mode
```

## Architecture

### Backend (Port 8000)
- **GET** `/examples` - Return JSON list of input–output pairs from `data/examples.jsonl`
- **POST** `/annotations` - Accept annotation data and append to `data/annotations.csv`
- **GET** `/export` - Serve downloadable CSV of annotations
- **GET** `/health` - Health check endpoint

### Frontend (Port 3001)
- Main annotation interface with prompt/response display
- Multi-select dropdown for error categories
- Text area for comments
- Navigation controls for examples
- Export functionality

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | `8000` | Backend server port |
| `FRONTEND_PORT` | `3001` | Frontend development server port |
| `LLM_API_URL` | `http://localhost:11434` | LLM API endpoint (Ollama/LM Studio) |

## Development

### Backend Development
```bash
cd backend
go mod tidy
go run main.go
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## Data Format

### Input Data (`data/examples.jsonl`)
```json
{"id": "1", "prompt": "What is the capital of France?", "response": "Paris is the capital of France."}
{"id": "2", "prompt": "Explain quantum computing", "response": "Quantum computing uses quantum bits..."}
```

### Annotation Output (`data/annotations.csv`)
```csv
id,labels,notes,timestamp
1,"accuracy,helpfulness","Good response",2024-01-01T10:00:00Z
2,"clarity","Could be more detailed",2024-01-01T10:05:00Z
```

## Project Structure

```
LLM Notator/
├── backend/                 # Gin (Go) REST API
│   ├── main.go
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
├── frontend/                # Next.js frontend
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── Dockerfile
├── data/                    # Data directory
│   ├── examples.jsonl
│   └── annotations.csv
├── docker-compose.yml
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `docker compose up --build`
5. Submit a pull request

## License

MIT License 