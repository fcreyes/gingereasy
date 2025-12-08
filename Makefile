.PHONY: help dev dev-build dev-up dev-down dev-logs prod prod-build prod-up prod-down prod-logs clean ps

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
