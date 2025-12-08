.PHONY: help dev dev-build dev-up dev-down dev-logs prod prod-build prod-up prod-down prod-logs clean ps lint lint-backend lint-frontend setup-hooks

# Export UID/GID for docker-compose to run as current user
export UID := $(shell id -u)
export GID := $(shell id -g)

# Default target
help:
	@echo "Gingerbread Development Commands"
	@echo ""
	@echo "Development (Vite hot-reload):"
	@echo "  make dev          - Build and start dev environment"
	@echo "  make dev-build    - Build dev containers"
	@echo "  make dev-up       - Start dev containers"
	@echo "  make dev-down     - Stop dev containers"
	@echo "  make dev-logs     - Tail dev logs"
	@echo ""
	@echo "Production (Caddy + static build, mirrors Railway):"
	@echo "  make prod         - Build and start prod environment"
	@echo "  make prod-build   - Build prod containers"
	@echo "  make prod-up      - Start prod containers"
	@echo "  make prod-down    - Stop prod containers"
	@echo "  make prod-logs    - Tail prod logs"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint         - Run all linters"
	@echo "  make lint-backend - Run backend linters (ruff, mypy)"
	@echo "  make lint-frontend- Run frontend linters (eslint, prettier)"
	@echo ""
	@echo "Setup:"
	@echo "  make setup-hooks  - Install git pre-commit hooks"
	@echo ""
	@echo "Utility:"
	@echo "  make ps           - Show running containers"
	@echo "  make clean        - Stop all and remove volumes"

# Development targets (Vite dev server with hot reload)
dev: dev-build dev-up

dev-build:
	docker-compose build

dev-up:
	docker-compose up -d

dev-down:
	docker-compose down

dev-logs:
	docker-compose logs -f

# Production targets (Caddy + static build, mirrors Railway)
prod: prod-build prod-up

prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-up:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Utility targets
ps:
	docker-compose ps 2>/dev/null || true
	docker-compose -f docker-compose.prod.yml ps 2>/dev/null || true

clean:
	docker-compose down -v 2>/dev/null || true
	docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true

# Code quality targets (run in containers to avoid permission issues)
lint: lint-backend lint-frontend

lint-backend:
	docker-compose run --rm -T --no-deps backend sh -c "uv sync --dev && uv run ruff check . && uv run ruff format --check . && uv run mypy . --ignore-missing-imports"

lint-frontend:
	docker-compose run --rm -T --no-deps frontend sh -c "npm ci && npm run lint && npm run format:check && npm run typecheck"

# Local lint targets (requires local uv/npm - may have permission issues with Docker volumes)
lint-local-backend:
	cd backend && uv sync --dev && uv run ruff check . && uv run ruff format --check . && uv run mypy . --ignore-missing-imports

lint-local-frontend:
	cd frontend && npm ci && npm run lint && npm run format:check && npm run typecheck

# Setup targets
setup-hooks:
	@echo "Installing pre-commit hook..."
	@cp scripts/pre-commit .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "Pre-commit hook installed! It will run on every commit."
