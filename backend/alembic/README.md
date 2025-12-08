# Alembic Database Migrations

This project uses Alembic for database schema migrations with SQLAlchemy.

## Architecture Overview

This project uses a **hybrid approach**:
1. **Alembic migrations** run first (on deployment)
2. **`Base.metadata.create_all()`** runs after (in `main.py`)

This means:
- **Fresh databases**: Alembic does nothing (tables don't exist), then `create_all()` creates them with the latest schema
- **Existing databases**: Alembic migrates the schema, then `create_all()` does nothing (tables already exist)

## Common Commands

```bash
# Check current migration state
uv run alembic current

# Show migration history
uv run alembic history

# Create a new migration (auto-generate from model changes)
uv run alembic revision --autogenerate -m "description_of_changes"

# Apply all pending migrations
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1

# Rollback all migrations
uv run alembic downgrade base

# Show SQL without executing (useful for debugging)
uv run alembic upgrade head --sql
```

## Development Workflow

### 1. Making Schema Changes

1. **Update the model** in `models.py`
2. **Generate migration**:
   ```bash
   uv run alembic revision --autogenerate -m "add_new_column"
   ```
3. **Review the generated migration** in `alembic/versions/`
4. **Test locally**:
   ```bash
   docker-compose down -v  # Fresh database
   docker-compose up -d
   # Check logs for migration output
   docker-compose logs backend
   ```
5. **Commit and push**

### 2. Testing Migrations

Always test migrations against:
- **Fresh database**: `docker-compose down -v && docker-compose up -d`
- **Existing database**: Start with data, then apply migration

### 3. Connecting to Railway Database

To run migrations against Railway:

```bash
# Get the DATABASE_URL from Railway (requires TCP proxy enabled)
DATABASE_URL="postgresql://user:pass@host:port/railway" uv run alembic upgrade head
```

## Lessons Learned

### Issue: Migration Marked as Done But Schema Not Applied

**Symptom**: App crashes with "column X does not exist" but `alembic current` shows migration is applied.

**Root Cause**: The migration used `IF EXISTS` checks that silently did nothing when conditions weren't met. Alembic marked it as "done" even though no actual changes occurred.

**Diagnosis Steps**:
1. Check alembic state: `uv run alembic current`
2. Verify actual schema in database
3. Compare expected vs actual columns

**Fix**:
```bash
# Reset alembic version tracking
DATABASE_URL="..." uv run alembic downgrade base

# Re-run migration
DATABASE_URL="..." uv run alembic upgrade head

# Verify schema
DATABASE_URL="..." uv run python -c "
import psycopg2
conn = psycopg2.connect('...')
cur = conn.cursor()
cur.execute(\"SELECT column_name FROM information_schema.columns WHERE table_name = 'your_table'\")
print([r[0] for r in cur.fetchall()])
"
```

### Best Practices

1. **Avoid overly complex idempotent migrations**
   - `IF EXISTS` checks can hide failures
   - Prefer simple, atomic migrations
   - If you need conditional logic, add explicit error handling

2. **Always verify after migration**
   - Check that expected columns/tables exist
   - Don't assume success just because alembic didn't error

3. **Test migrations on realistic data**
   - Empty databases behave differently than populated ones
   - Test with production-like data when possible

4. **Keep migrations small and focused**
   - One logical change per migration
   - Easier to debug and rollback

5. **Never modify already-applied migrations**
   - Once pushed to production, create a new migration instead
   - Modifying existing migrations causes version tracking issues

### Writing Idempotent Migrations (PostgreSQL)

If you need migrations that can run multiple times safely:

```python
def upgrade():
    # Good: Check and modify only if needed
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT FROM information_schema.columns
                WHERE table_name = 'mytable' AND column_name = 'newcol'
            ) THEN
                ALTER TABLE mytable ADD COLUMN newcol VARCHAR(100);
            END IF;
        END $$;
    """)
```

**Warning**: This approach means failures are silent. Add logging or verification:

```python
def upgrade():
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (...) THEN
                ALTER TABLE mytable ADD COLUMN newcol VARCHAR(100);
                RAISE NOTICE 'Added column newcol to mytable';
            ELSE
                RAISE NOTICE 'Column newcol already exists, skipping';
            END IF;
        END $$;
    """)
```

## Railway Deployment

Migrations run automatically on deployment via `railway.json`:

```json
{
  "deploy": {
    "startCommand": "sh -c 'uv run alembic upgrade head && uv run hypercorn main:app --bind [::]:${PORT:-8000}'"
  }
}
```

### Troubleshooting Railway

1. **Enable TCP Proxy** for Postgres in Railway dashboard (Settings > Networking)
2. **Get connection string**: Railway dashboard > Postgres > Variables > `DATABASE_PUBLIC_URL`
3. **Run migrations manually** if needed:
   ```bash
   DATABASE_URL="postgresql://..." uv run alembic upgrade head
   ```

## File Structure

```
alembic/
├── env.py              # Alembic environment config (loads DATABASE_URL)
├── script.py.mako      # Template for new migrations
├── versions/           # Migration files
│   └── xxx_description.py
├── alembic.ini         # Alembic config (in parent directory)
└── README.md           # This file
```
