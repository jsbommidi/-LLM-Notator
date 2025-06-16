# LLM Notator Makefile

.PHONY: help build up down logs clean dev-backend dev-frontend

help: ## Show this help message
	@echo "LLM Notator - Development Commands"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make \033[36m<target>\033[0m\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

build: ## Build Docker containers
	docker compose build

up: ## Start the application with Docker Compose
	docker compose up --build

down: ## Stop the application
	docker compose down

logs: ## View application logs
	docker compose logs -f

clean: ## Clean up Docker containers and images
	docker compose down -v --remove-orphans
	docker system prune -f

dev-backend: ## Run backend in development mode
	cd backend && go run main.go

dev-frontend: ## Run frontend in development mode
	cd frontend && npm run dev

install-backend: ## Install backend dependencies
	cd backend && go mod tidy

install-frontend: ## Install frontend dependencies
	cd frontend && npm install

test: ## Run tests (placeholder)
	@echo "No tests configured yet"

format: ## Format code
	cd backend && go fmt ./...
	cd frontend && npm run lint

# Default target
.DEFAULT_GOAL := help 