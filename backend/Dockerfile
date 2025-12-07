FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

WORKDIR /app

# Copy dependency files
COPY pyproject.toml .

# Install dependencies using uv
RUN uv sync --no-dev --no-install-project

# Copy application code
COPY . .

EXPOSE 8000

# Run with uv
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
