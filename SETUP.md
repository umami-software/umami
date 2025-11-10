# Umami Setup Guide

This guide will walk you through setting up Umami for local development from scratch.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Building the Application](#building-the-application)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [Quick Start](#quick-start)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required

1. **Node.js** (version 18.18 or newer)
   - Check your version: `node --version`
   - Download: [https://nodejs.org/](https://nodejs.org/)

2. **pnpm** (package manager)
   - Check if installed: `pnpm --version`
   - Install: `npm install -g pnpm`
   - Documentation: [https://pnpm.io/installation](https://pnpm.io/installation)

3. **PostgreSQL** (version 12.14 or newer)
   - Check your version: `psql --version`
   - Download: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
   - Ensure PostgreSQL service is running

### Optional

- **Git** - For cloning the repository
- **Docker** - For containerized deployment (alternative to local setup)

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/umami-software/umami.git
cd umami
```

**Expected Output:** Repository cloned successfully

### Step 2: Install Dependencies

```bash
pnpm install
```

**Expected Output:**
```
Packages: +XXX
++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved XXX, reused XXX, downloaded X, added XXX, done
```

**Note:** This may take a few minutes depending on your internet connection.

### Step 3: Validate Setup

Run the setup validator to check if everything is configured correctly:

```bash
node scripts/setup-validator.js
```

**Expected Output:**
```
🔍 Validating Umami Setup...

✓ Node.js Version: Node.js X.X.X is installed (minimum: 18.18.0)
✓ Package Manager (pnpm): pnpm X.X.X is installed
✗ Environment Configuration: .env file not found
  💡 Solution: Copy .env.example to .env and configure your database connection
```

## Environment Configuration

### Step 1: Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### Step 2: Configure Database Connection

Open `.env` in your text editor and update the `DATABASE_URL`:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/umami
```

Replace:
- `username` - Your PostgreSQL username (default: `postgres`)
- `password` - Your PostgreSQL password
- `localhost` - Database host (use `localhost` for local development)
- `5432` - PostgreSQL port (default: 5432)
- `umami` - Database name (you'll create this in the next step)

### Step 3: Optional Configuration

The `.env` file contains other optional variables you can configure:

- `BASE_PATH` - Host Umami under a subdirectory (e.g., `/analytics`)
- `TRACKER_SCRIPT_NAME` - Custom names for the tracking script
- `FORCE_SSL` - Force HTTPS connections in production
- `DEFAULT_LOCALE` - Set default language

See `.env.example` for all available options and their descriptions.

## Database Setup

### Step 1: Create PostgreSQL Database

Connect to PostgreSQL and create a database for Umami:

```bash
# Using createdb command
createdb umami

# Or using psql
psql -U postgres
CREATE DATABASE umami;
\q
```

### Step 2: Verify Database Connection

Test your database connection:

```bash
psql -U your_username -d umami -h localhost
```

If successful, you'll see the PostgreSQL prompt. Type `\q` to exit.

### Step 3: Validate Database Configuration

Run the database check script:

```bash
node scripts/check-db.js
```

**Expected Output:**
```
🔍 Checking Database Configuration...

✓ DATABASE_URL is defined and format is valid.
✓ Database connection successful.
✓ Database version check successful (PostgreSQL X.X.X).
✓ Database is up to date.

✅ All database checks passed!
```

## Building the Application

### Step 1: Run the Build

```bash
pnpm run build
```

This command will:
1. Validate environment variables
2. Generate Prisma client
3. Run database migrations (creates tables)
4. Build the tracking script
5. Build the Next.js application

**Expected Output:**
```
✓ Environment variables validated successfully
✓ Prisma client generated
✓ Database migrations applied
✓ Tracking script built
✓ Next.js build completed
```

**Note:** The first build will:
- Create all necessary database tables
- Generate a default admin user:
  - **Username:** `admin`
  - **Password:** `umami`
  - ⚠️ **Important:** Change this password after first login!

### Step 2: Verify Build

Check that the build completed successfully:

```bash
ls -la .next
```

You should see a `.next` directory with build artifacts.

## Running the Application

### Development Mode

For development with hot-reload:

```bash
pnpm run dev
```

**Expected Output:**
```
✓ Ready on http://localhost:3001
```

The application will be available at: **http://localhost:3001**

Features in development mode:
- Hot module replacement (HMR)
- Detailed error messages
- Source maps for debugging
- Turbo mode for faster builds

### Production Mode

For production deployment:

```bash
pnpm run start
```

**Expected Output:**
```
✓ Ready on http://localhost:3000
```

The application will be available at: **http://localhost:3000**

**Note:** You must run `pnpm run build` before starting in production mode.

### First Login

1. Open your browser and navigate to the application URL
2. Log in with default credentials:
   - Username: `admin`
   - Password: `umami`
3. **Immediately change the password** in Settings → Profile

## Troubleshooting

### Common Issues and Solutions

#### Issue: "DATABASE_URL is not defined"

**Cause:** Missing or incorrect `.env` file

**Solution:**
1. Ensure `.env` file exists in project root
2. Verify `DATABASE_URL` is set correctly
3. Check for typos in the connection string

```bash
# Verify .env file exists
ls -la .env

# Check DATABASE_URL format
cat .env | grep DATABASE_URL
```

#### Issue: "Unable to connect to the database"

**Cause:** PostgreSQL is not running or connection details are incorrect

**Solution:**
1. Check if PostgreSQL is running:
   ```bash
   # Linux/macOS
   pg_ctl status
   # or
   systemctl status postgresql
   
   # Windows
   sc query postgresql
   ```

2. Start PostgreSQL if not running:
   ```bash
   # Linux/macOS
   pg_ctl start
   # or
   systemctl start postgresql
   
   # Windows
   net start postgresql
   ```

3. Verify connection details:
   ```bash
   psql -U your_username -d umami -h localhost
   ```

4. Check PostgreSQL logs for errors:
   ```bash
   # Location varies by system
   tail -f /var/log/postgresql/postgresql-XX-main.log
   ```

#### Issue: "Database version is not compatible"

**Cause:** PostgreSQL version is below 12.14

**Solution:**
Upgrade PostgreSQL to version 12.14 or newer:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql-14

# macOS (Homebrew)
brew upgrade postgresql

# Windows
# Download installer from https://www.postgresql.org/download/windows/
```

#### Issue: "Node.js version is too old"

**Cause:** Node.js version is below 18.18

**Solution:**
Upgrade Node.js:

```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from https://nodejs.org/
```

#### Issue: "pnpm: command not found"

**Cause:** pnpm is not installed

**Solution:**
```bash
npm install -g pnpm
```

#### Issue: "Build fails with Prisma errors"

**Cause:** Prisma client not generated or database not accessible

**Solution:**
1. Ensure database is running and accessible
2. Regenerate Prisma client:
   ```bash
   pnpm run build-db
   ```
3. Check database connection:
   ```bash
   node scripts/check-db.js
   ```

#### Issue: "Port 3000 or 3001 already in use"

**Cause:** Another application is using the port

**Solution:**
1. Find and stop the process using the port:
   ```bash
   # Linux/macOS
   lsof -i :3001
   kill -9 <PID>
   
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   ```

2. Or use a different port:
   ```bash
   # Development
   PORT=3002 pnpm run dev
   
   # Production
   PORT=3002 pnpm run start
   ```

#### Issue: "Cannot find module" errors

**Cause:** Dependencies not installed or corrupted

**Solution:**
1. Clean install dependencies:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

2. Clear Next.js cache:
   ```bash
   rm -rf .next
   pnpm run build
   ```

### Database Connection Troubleshooting

#### Test Database Connection Manually

```bash
psql postgresql://username:password@localhost:5432/umami
```

If this fails, check:
1. PostgreSQL service is running
2. Username and password are correct
3. Database exists
4. Host and port are correct
5. Firewall allows connections

#### Check PostgreSQL Configuration

```bash
# Find PostgreSQL config file
psql -U postgres -c 'SHOW config_file'

# Check if PostgreSQL is listening on correct port
psql -U postgres -c 'SHOW port'

# Check allowed connections
cat /path/to/pg_hba.conf
```

### Getting Help

If you're still experiencing issues:

1. **Check the logs:**
   - Application logs in terminal
   - PostgreSQL logs
   - Browser console (F12)

2. **Search existing issues:**
   - [GitHub Issues](https://github.com/umami-software/umami/issues)

3. **Ask for help:**
   - [Discord Community](https://umami.is/discord)
   - [GitHub Discussions](https://github.com/umami-software/umami/discussions)

4. **Provide information when asking for help:**
   - Operating system and version
   - Node.js version (`node --version`)
   - PostgreSQL version (`psql --version`)
   - Error messages (full stack trace)
   - Steps to reproduce the issue

## Quick Start

For experienced developers, here's the condensed version:

```bash
# 1. Clone and install
git clone https://github.com/umami-software/umami.git
cd umami
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL

# 3. Create database
createdb umami

# 4. Validate setup
node scripts/setup-validator.js
node scripts/check-db.js

# 5. Build and run
pnpm run build
pnpm run dev

# 6. Access application
# Open http://localhost:3001
# Login: admin / umami
```

### Interactive Setup Wizard

For a guided setup experience, use the interactive wizard:

```bash
node scripts/quick-setup.js
```

This will walk you through:
- Prerequisite checks
- Database configuration
- Environment file creation
- Dependency installation
- Build process
- First run

---

## Next Steps

After successful setup:

1. **Change default password** - Go to Settings → Profile
2. **Add your first website** - Go to Websites → Add Website
3. **Install tracking code** - Copy the tracking script to your website
4. **Explore features** - Check out dashboards, reports, and analytics

## Additional Resources

- [Official Documentation](https://umami.is/docs)
- [API Documentation](https://umami.is/docs/api)
- [GitHub Repository](https://github.com/umami-software/umami)
- [Community Discord](https://umami.is/discord)

---

**Need help?** Join our [Discord community](https://umami.is/discord) or check [GitHub Discussions](https://github.com/umami-software/umami/discussions).
