# GingerEasy - Gingerbread House Listings

A StreetEasy-style real estate application for gingerbread house listings. Built with FastAPI, React, and PostgreSQL.

## Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │              Private Network                 │
                    │                                              │
[Browser] ──────────┼──► [Frontend] ──► [Backend] ──► [PostgreSQL] │
                    │        │              │                      │
                    │        │              └────► [MinIO S3]      │
                    │        │                                     │
                    └────────┼─────────────────────────────────────┘
                             │
                    Only public service
```

- **Frontend**: React + Vite (dev) / nginx (prod) - serves static files and proxies `/api/` to backend
- **Backend**: FastAPI with uv package manager - handles API requests and proxies images from MinIO
- **Database**: PostgreSQL - stores listing data
- **Storage**: MinIO (S3-compatible) - stores uploaded images

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.11+ with uv (for local backend development)

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the app at: **http://localhost:5174**

### Local Development (without Docker)

**Backend:**
```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
gingerbread/
├── backend/
│   ├── main.py           # FastAPI application
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── database.py       # Database configuration
│   ├── pyproject.toml    # Python dependencies (uv)
│   ├── Dockerfile        # Backend container (uv-based)
│   └── railway.json      # Railway deployment config
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # React components
│   │   └── index.css     # Styles
│   ├── vite.config.js    # Vite config with API proxy
│   ├── nginx.conf        # Production nginx config
│   ├── Dockerfile        # Dev container
│   ├── Dockerfile.prod   # Production container (nginx)
│   └── railway.json      # Railway deployment config
├── minio/
│   ├── Dockerfile        # MinIO container for Railway
│   └── railway.json      # Railway deployment config
├── docker-compose.yml    # Local development setup
└── RAILWAY_DEPLOYMENT.md # Railway deployment guide
```

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `S3_ENDPOINT` | MinIO/S3 endpoint URL | `http://localhost:9000` |
| `S3_ACCESS_KEY` | S3 access key | `minioadmin` |
| `S3_SECRET_KEY` | S3 secret key | `minioadmin123` |
| `S3_BUCKET` | S3 bucket name | `gingerbread` |
| `S3_PUBLIC_URL` | Public URL for images (use `/api/images` for proxy mode) | `http://localhost:9000` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKEND_URL` | Backend URL for nginx proxy (production) | `http://backend:8000` |
| `VITE_API_URL` | API URL override (optional, uses relative URLs by default) | `` |

## Deployment

### Railway

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed Railway deployment instructions.

**Quick Deploy:**
```bash
# Link to Railway project
railway link

# Deploy backend
railway service gingereasy
railway up backend --path-as-root

# Deploy frontend
railway service gingereasy-frontend
railway up frontend --path-as-root
```

## Private Networking

This application uses private networking for security:

- Only the **frontend** is publicly accessible
- **Backend**, **database**, and **S3 storage** communicate on an internal network
- Images are proxied through the backend (`/api/images/{filename}`)

### Docker Networks

- `internal` - Private network for backend, database, and MinIO (not accessible from host)
- `public` - Bridge network for frontend (accessible from host)

### Railway Networks

Services communicate via Railway's private network using `*.railway.internal` DNS names.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | List all listings (with filters) |
| GET | `/api/listings/{id}` | Get single listing |
| POST | `/api/listings` | Create listing |
| PUT | `/api/listings/{id}` | Update listing |
| DELETE | `/api/listings/{id}` | Delete listing |
| POST | `/api/upload` | Upload image |
| GET | `/api/images/{filename}` | Get image (proxy from S3) |
| GET | `/api/neighborhoods` | List unique neighborhoods |

## Known Issues and Fixes

### Docker Credential Error in WSL

**Error:**
```
error getting credentials - err: exit status 1, out: ``
```

**Cause:** Docker Desktop's credential store (`desktop.exe`) isn't accessible from WSL.

**Fix:** Edit `~/.docker/config.json` and set `credsStore` to empty:
```json
{
  "credsStore": ""
}
```

**References:**
- [GitHub Issue #11261](https://github.com/docker/for-win/issues/11261)
- [WSL Docker Credential Fix](https://hakanu.net/docker/2024/10/05/solution-of-error-getting-credentials-err-exec-docker-credential-desktop-exe-executable-file-not-found-in-path-docker-on-wsl-ubuntu/)

### Railway Deployment PORT Issue

**Error:**
```
Error: Invalid value for '--port': '$PORT' is not a valid integer.
```

**Cause:** Railway's `$PORT` variable isn't expanded when passed directly to uvicorn.

**Fix:** Wrap the command in a shell:
```json
{
  "deploy": {
    "startCommand": "sh -c 'uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}'"
  }
}
```

## Tech Stack

- **Frontend**: React 18, Vite, React Router
- **Backend**: FastAPI, SQLAlchemy, Pydantic, boto3
- **Database**: PostgreSQL 15
- **Storage**: MinIO (S3-compatible)
- **Package Manager**: uv (Python), npm (Node.js)
- **Deployment**: Railway, Docker

## License

MIT
