# Railway Deployment Guide

This guide explains how to deploy GingerEasy to Railway as a monorepo with separate services.

## Prerequisites

1. A [Railway](https://railway.app) account
2. A GitHub repository with this code
3. An S3-compatible storage provider (AWS S3, Cloudflare R2, or Backblaze B2)

## Architecture

The app consists of 3 services on Railway:
- **Backend** - FastAPI Python API
- **Frontend** - Vite React static site
- **PostgreSQL** - Railway managed database (add-on)

Plus external S3 storage for images.

## Step 1: Create Railway Project

1. Go to [Railway](https://railway.app) and create a new project
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account and select this repository

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically create a `DATABASE_URL` variable

## Step 3: Create Backend Service

1. Click "New" → "GitHub Repo" → Select this repo
2. In service settings:
   - Set **Root Directory**: `backend`
   - Set **Watch Paths**: `backend/**`
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference) |
| `S3_ENDPOINT` | Your S3 endpoint (e.g., `https://s3.amazonaws.com`) |
| `S3_ACCESS_KEY` | Your S3 access key |
| `S3_SECRET_KEY` | Your S3 secret key |
| `S3_BUCKET` | Your bucket name (e.g., `gingerbread`) |
| `S3_PUBLIC_URL` | Public URL for your bucket |
| `ALLOWED_ORIGINS` | `${{Frontend.RAILWAY_PUBLIC_DOMAIN}}` (set after frontend is created) |

4. Deploy and note the public domain (e.g., `backend-xxx.up.railway.app`)

## Step 4: Create Frontend Service

1. Click "New" → "GitHub Repo" → Select this repo again
2. In service settings:
   - Set **Root Directory**: `frontend`
   - Set **Watch Paths**: `frontend/**`
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://backend-xxx.up.railway.app` (your backend URL) |

4. Deploy

## Step 5: Update Backend CORS

After the frontend is deployed, update the backend's `ALLOWED_ORIGINS`:

```
ALLOWED_ORIGINS=https://frontend-xxx.up.railway.app
```

## S3 Storage Setup

### Option A: AWS S3

1. Create an S3 bucket with public read access
2. Create IAM credentials with S3 access
3. Set environment variables:
   ```
   S3_ENDPOINT=https://s3.amazonaws.com
   S3_ACCESS_KEY=your-access-key
   S3_SECRET_KEY=your-secret-key
   S3_BUCKET=your-bucket-name
   S3_PUBLIC_URL=https://your-bucket-name.s3.amazonaws.com
   ```

### Option B: Cloudflare R2 (Recommended - Free tier)

1. Create an R2 bucket in Cloudflare dashboard
2. Enable public access and note the public URL
3. Create R2 API tokens
4. Set environment variables:
   ```
   S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
   S3_ACCESS_KEY=your-r2-access-key
   S3_SECRET_KEY=your-r2-secret-key
   S3_BUCKET=your-bucket-name
   S3_PUBLIC_URL=https://pub-<id>.r2.dev
   ```

### Option C: Backblaze B2

1. Create a B2 bucket with public access
2. Create application keys
3. Set environment variables:
   ```
   S3_ENDPOINT=https://s3.us-west-002.backblazeb2.com
   S3_ACCESS_KEY=your-key-id
   S3_SECRET_KEY=your-application-key
   S3_BUCKET=your-bucket-name
   S3_PUBLIC_URL=https://f002.backblazeb2.com/file/your-bucket-name
   ```

## Environment Variables Summary

### Backend Service

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-set by Railway |
| `S3_ENDPOINT` | S3 API endpoint | `https://s3.amazonaws.com` |
| `S3_ACCESS_KEY` | S3 access key ID | `AKIA...` |
| `S3_SECRET_KEY` | S3 secret access key | `...` |
| `S3_BUCKET` | S3 bucket name | `gingerbread` |
| `S3_PUBLIC_URL` | Public URL for bucket | `https://bucket.s3.amazonaws.com` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://your-frontend.up.railway.app` |

### Frontend Service

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.up.railway.app` |

## Local Development

For local development, continue using Docker Compose:

```bash
docker-compose up -d
```

This runs:
- Frontend: http://localhost:5174
- Backend: http://localhost:8000
- PostgreSQL: localhost:5433
- MinIO (S3): http://localhost:9002 (API), http://localhost:9003 (Console)

## Troubleshooting

### Images not loading
- Check S3 bucket has public read access
- Verify `S3_PUBLIC_URL` is correct
- Check browser console for CORS errors

### CORS errors
- Ensure `ALLOWED_ORIGINS` includes your frontend domain
- Include the full URL with `https://`

### Database connection failed
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running in Railway

### Build fails
- Check Railway build logs
- Ensure all dependencies are in requirements.txt / package.json
