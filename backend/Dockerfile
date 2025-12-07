FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

WORKDIR /app

# Copy dependency files
COPY pyproject.toml .

# Install dependencies using uv
RUN uv sync --no-dev --no-install-project

# Copy application code
COPY . .

EXPOSE 8000

# Run with uv - hypercorn with [::] binds to both IPv4 and IPv6 on Linux
CMD ["uv", "run", "hypercorn", "main:app", "--bind", "[::]:8000"]
