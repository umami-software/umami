# PostgreSQL 17 + Apache AGE + TimescaleDB Docker Image

This directory contains the Dockerfile and initialization scripts for building a custom PostgreSQL 17 image with Apache AGE 1.6.0 and TimescaleDB 2.23.0 extensions.

## What's Included

- **PostgreSQL 17** - Latest PostgreSQL version
- **Apache AGE 1.6.0** - Graph database extension for user journey tracking
- **TimescaleDB 2.23.0** - Time-series database extension for analytics

## Building the Image

```bash
# From the umami directory
docker build -t postgres:17-age-timescaledb -f docker/postgres/Dockerfile docker/postgres
```

## Using with Docker Compose

The image is automatically built when using `docker-compose.upgraded.yml`:

```bash
# Start the upgraded stack
docker-compose -f docker-compose.upgraded.yml up -d

# View logs
docker-compose -f docker-compose.upgraded.yml logs -f

# Stop the stack
docker-compose -f docker-compose.upgraded.yml down
```

## Running Migrations

After the database is up, run the Prisma migrations:

```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy
```

## Verifying Extensions

Connect to the database and verify extensions are installed:

```bash
# Connect to PostgreSQL
docker-compose -f docker-compose.upgraded.yml exec db psql -U umami -d umami

# Check installed extensions
SELECT extname, extversion FROM pg_extension WHERE extname IN ('timescaledb', 'age');

# Check Apache AGE graph
SELECT * FROM ag_catalog.ag_graph;

# Check TimescaleDB hypertables
SELECT * FROM timescaledb_information.hypertables;
```

## Configuration

The PostgreSQL instance is configured with optimized settings for performance:

- `shared_buffers = 256MB`
- `effective_cache_size = 1GB`
- `maintenance_work_mem = 128MB`
- `max_connections = 200`

Adjust these in `docker-compose.upgraded.yml` based on your server resources.

## Initialization Scripts

Scripts in `init-scripts/` run automatically when the container is first created:

- `01-init-extensions.sh` - Installs TimescaleDB and Apache AGE extensions

## Troubleshooting

### Extensions not loading

If extensions fail to load, check the logs:

```bash
docker-compose -f docker-compose.upgraded.yml logs db
```

### Build failures

If the build fails, ensure you have enough disk space and memory:

```bash
# Check Docker resources
docker system df

# Clean up if needed
docker system prune -a
```

### Connection issues

Verify the database is healthy:

```bash
docker-compose -f docker-compose.upgraded.yml ps
docker-compose -f docker-compose.upgraded.yml exec db pg_isready -U umami
```

## Production Deployment

For production, use a managed PostgreSQL service or dedicated server instead of Docker. See the main [DEPLOYMENT.md](../../recommendation-engine/docs/DEPLOYMENT.md) for details.

## Data Persistence

Database data is stored in the `umami-db-data` Docker volume. To backup:

```bash
# Backup
docker-compose -f docker-compose.upgraded.yml exec db pg_dump -U umami umami > backup.sql

# Restore
docker-compose -f docker-compose.upgraded.yml exec -T db psql -U umami umami < backup.sql
```

## Security Notes

- Change default passwords in production
- Use environment variables for sensitive data
- Enable SSL/TLS for database connections
- Restrict network access to the database port

## Support

For issues or questions, refer to:
- [PostgreSQL Documentation](https://www.postgresql.org/docs/17/)
- [Apache AGE Documentation](https://age.apache.org/docs/)
- [TimescaleDB Documentation](https://docs.timescale.com/)

