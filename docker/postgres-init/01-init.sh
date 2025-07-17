#!/bin/bash
# PostgreSQL initialization script for Kosera API

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create extensions if needed
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Grant permissions
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
    
    -- Create schema if needed
    -- CREATE SCHEMA IF NOT EXISTS kosera;
    
    \echo 'PostgreSQL database initialized for Kosera API'
EOSQL
