#!/bin/bash
# Initialize PostgreSQL extensions for Umami
# This script runs automatically when the container is first created

set -e

echo "=================================================="
echo "Initializing PostgreSQL 17 with Extensions"
echo "=================================================="

# Wait for PostgreSQL to be ready
until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo "PostgreSQL is ready. Installing extensions..."

# Connect to the database and install extensions
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Install TimescaleDB extension
    CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
    
    -- Install Apache AGE extension
    CREATE EXTENSION IF NOT EXISTS age CASCADE;
    
    -- Load AGE into search path
    SET search_path = ag_catalog, "\$user", public;
    
    -- Verify installations
    SELECT extname, extversion FROM pg_extension WHERE extname IN ('timescaledb', 'age');
EOSQL

echo "=================================================="
echo "Extensions installed successfully!"
echo "- TimescaleDB: Installed"
echo "- Apache AGE: Installed"
echo "=================================================="

echo "Database is ready for Umami migrations."

