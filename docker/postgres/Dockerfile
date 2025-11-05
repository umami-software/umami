# PostgreSQL 17 with Apache AGE 1.6.0 and TimescaleDB 2.23.0
# For Umami Analytics Upgrade - Hyper-Personalized Marketing System

FROM postgres:17-alpine

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    clang \
    llvm \
    git \
    cmake \
    bison \
    flex \
    readline-dev \
    zlib-dev \
    curl \
    ca-certificates

# Set PostgreSQL version for compatibility
ENV PG_MAJOR=17
ENV PG_VERSION=17

# Install TimescaleDB 2.23.0
ENV TIMESCALEDB_VERSION=2.23.0
RUN set -ex \
    && apk add --no-cache --virtual .fetch-deps \
        ca-certificates \
        openssl \
        tar \
    && mkdir -p /tmp/timescaledb \
    && cd /tmp/timescaledb \
    && wget -O timescaledb.tar.gz "https://github.com/timescale/timescaledb/archive/${TIMESCALEDB_VERSION}.tar.gz" \
    && tar -xzf timescaledb.tar.gz -C /tmp/timescaledb --strip-components=1 \
    && cd /tmp/timescaledb \
    && ./bootstrap -DREGRESS_CHECKS=OFF -DPROJECT_INSTALL_METHOD="docker" \
    && cd build && make install \
    && cd / \
    && rm -rf /tmp/timescaledb \
    && apk del .fetch-deps

# Install Apache AGE 1.6.0
ENV AGE_VERSION=1.6.0
RUN set -ex \
    && mkdir -p /tmp/age \
    && cd /tmp/age \
    && wget -O age.tar.gz "https://github.com/apache/age/archive/refs/tags/v${AGE_VERSION}.tar.gz" \
    && tar -xzf age.tar.gz -C /tmp/age --strip-components=1 \
    && cd /tmp/age \
    && make PG_CONFIG=/usr/local/bin/pg_config install \
    && cd / \
    && rm -rf /tmp/age

# Clean up build dependencies
RUN apk del build-base clang llvm git cmake bison flex

# Configure PostgreSQL to load extensions
RUN echo "shared_preload_libraries = 'timescaledb,age'" >> /usr/local/share/postgresql/postgresql.conf.sample

# Add initialization script
COPY init-scripts/* /docker-entrypoint-initdb.d/

# Set proper permissions
RUN chmod +x /docker-entrypoint-initdb.d/*.sh || true

# Expose PostgreSQL port
EXPOSE 5432

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD pg_isready -U postgres || exit 1

# Use the default PostgreSQL entrypoint
CMD ["postgres"]

