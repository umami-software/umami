# Design Document

## Overview

This design document outlines the approach for setting up and configuring the Umami analytics platform for local development. The solution focuses on creating comprehensive setup documentation, validation scripts, and helper utilities that guide developers through the installation process while catching common configuration errors early.

The design leverages existing Umami infrastructure (check-env.js, check-db.js scripts) and extends it with additional validation, better error messaging, and a streamlined setup experience. The solution will be implemented as a combination of documentation improvements, enhanced validation scripts, and optional setup automation.

## Architecture

### High-Level Components

```mermaid
graph TD
    A[Developer] --> B[Setup Documentation]
    B --> C[Dependency Validation]
    C --> D[Environment Configuration]
    D --> E[Database Setup]
    E --> F[Build Process]
    F --> G[Application Running]
    
    C --> H[Validation Scripts]
    D --> H
    E --> H
    
    H --> I[check-env.js]
    H --> J[check-db.js]
    H --> K[setup-validator.js - New]
    
    style K fill:#90EE90
```

### Component Interaction Flow

1. **Setup Documentation** - Enhanced README with step-by-step instructions
2. **Dependency Validation** - Checks Node.js version and package manager
3. **Environment Configuration** - Validates .env file creation and format
4. **Database Setup** - Verifies PostgreSQL connection and version
5. **Build Process** - Executes build with proper error handling
6. **Application Running** - Starts dev or production server

## Components and Interfaces

### 1. Enhanced Setup Documentation

**Location**: `SETUP.md` (new file in project root)

**Purpose**: Provide comprehensive, step-by-step setup instructions with troubleshooting guidance

**Content Structure**:
- Prerequisites checklist
- Installation steps with expected outputs
- Environment configuration examples
- Database setup instructions
- Common error scenarios and solutions
- Quick start commands

### 2. Setup Validation Script

**Location**: `scripts/setup-validator.js` (new file)

**Purpose**: Comprehensive pre-flight check before running build or dev server

**Interface**:
```javascript
// Main validation function
async function validateSetup() {
  const checks = [
    checkNodeVersion(),
    checkPackageManager(),
    checkEnvFile(),
    checkDatabaseUrl(),
    checkDatabaseConnection(),
    checkDependencies()
  ];
  
  const results = await Promise.allSettled(checks);
  return formatResults(results);
}
```

**Validation Checks**:
- Node.js version >= 18.18
- pnpm is installed
- .env file exists
- DATABASE_URL is properly formatted
- Database is accessible
- node_modules are installed

### 3. Environment Template

**Location**: `.env.example` (new file)

**Purpose**: Provide a template for required environment variables

**Content**:
```bash
# Database Configuration (Required)
DATABASE_URL=postgresql://username:password@localhost:5432/umami

# Optional: Base path for deployment
# BASE_PATH=/analytics

# Optional: Tracker script customization
# TRACKER_SCRIPT_NAME=custom-script.js

# Optional: Cloud mode
# CLOUD_MODE=1
# CLOUD_URL=https://cloud.umami.is
```

### 4. Enhanced Error Messages

**Location**: Modifications to existing `scripts/check-env.js` and `scripts/check-db.js`

**Purpose**: Provide actionable error messages with solutions

**Enhancements**:
- Add color-coded output (already partially implemented with chalk)
- Include links to documentation
- Suggest specific fixes for common errors
- Show example configurations

### 5. Quick Setup Script

**Location**: `scripts/quick-setup.js` (new file)

**Purpose**: Interactive setup wizard for first-time users

**Interface**:
```javascript
async function quickSetup() {
  console.log('Welcome to Umami Setup Wizard');
  
  // Step 1: Check prerequisites
  await checkPrerequisites();
  
  // Step 2: Configure environment
  const dbUrl = await promptDatabaseUrl();
  await createEnvFile(dbUrl);
  
  // Step 3: Install dependencies
  await installDependencies();
  
  // Step 4: Validate database
  await validateDatabase();
  
  // Step 5: Run build
  await runBuild();
  
  console.log('Setup complete! Run "pnpm run dev" to start.');
}
```

## Data Models

### Validation Result Model

```typescript
interface ValidationResult {
  check: string;           // Name of the validation check
  status: 'pass' | 'fail' | 'warning';
  message: string;         // Human-readable message
  solution?: string;       // Suggested fix for failures
  documentation?: string;  // Link to relevant docs
}

interface SetupStatus {
  overall: 'ready' | 'incomplete' | 'error';
  checks: ValidationResult[];
  nextSteps: string[];
}
```

### Environment Configuration Model

```typescript
interface EnvironmentConfig {
  DATABASE_URL: string;    // Required
  BASE_PATH?: string;      // Optional
  CLOUD_MODE?: string;     // Optional
  CLOUD_URL?: string;      // Optional
  TRACKER_SCRIPT_NAME?: string; // Optional
}
```

## Error Handling

### Error Categories

1. **Missing Dependencies**
   - Error: Node.js not found or wrong version
   - Solution: Display installation link and required version
   - Exit code: 1

2. **Environment Configuration Errors**
   - Error: .env file missing
   - Solution: Provide .env.example template and creation instructions
   - Exit code: 1

3. **Database Connection Errors**
   - Error: Cannot connect to PostgreSQL
   - Solution: Check if PostgreSQL is running, verify credentials
   - Exit code: 1

4. **Database Version Errors**
   - Error: PostgreSQL version < 12.14
   - Solution: Display upgrade instructions
   - Exit code: 1

5. **Build Errors**
   - Error: Build process fails
   - Solution: Check logs, verify all previous steps completed
   - Exit code: 1

### Error Message Format

```javascript
function formatError(error) {
  return {
    title: chalk.red.bold(`✗ ${error.check} Failed`),
    message: error.message,
    solution: chalk.yellow(`💡 Solution: ${error.solution}`),
    docs: error.documentation ? 
      chalk.blue(`📖 See: ${error.documentation}`) : null
  };
}
```

## Testing Strategy

### Manual Testing Checklist

1. **Fresh Installation Test**
   - Clone repository to new directory
   - Run setup validator without any configuration
   - Verify all errors are caught and messages are clear
   - Follow error messages to fix issues
   - Verify successful setup

2. **Missing Environment Variable Test**
   - Remove DATABASE_URL from .env
   - Run check-env script
   - Verify clear error message with solution

3. **Invalid Database URL Test**
   - Provide malformed DATABASE_URL
   - Run check-db script
   - Verify connection error with troubleshooting steps

4. **Wrong Node Version Test**
   - Test with Node.js < 18.18 (if possible)
   - Verify version check fails with upgrade instructions

5. **Database Version Test**
   - Test with PostgreSQL < 12.14 (if available)
   - Verify version check fails with upgrade message

### Automated Testing

**Test File**: `scripts/__tests__/setup-validator.test.js`

**Test Cases**:
- Node version validation (pass/fail scenarios)
- Environment file existence check
- Database URL format validation
- Mock database connection tests
- Error message formatting

### Integration Testing

1. **End-to-End Setup Flow**
   - Start with clean environment
   - Run quick-setup script
   - Verify all steps complete successfully
   - Verify application starts correctly

2. **Error Recovery Flow**
   - Introduce errors at each step
   - Verify error is caught
   - Apply suggested solution
   - Verify recovery and continuation

## Implementation Notes

### Existing Infrastructure to Leverage

1. **check-env.js** - Already validates DATABASE_URL and CLOUD_URL variables
2. **check-db.js** - Already validates database connection and version
3. **package.json scripts** - Well-organized build pipeline
4. **next.config.ts** - Proper environment variable handling

### Enhancements Needed

1. **Better Error Messages**
   - Add more context to existing error messages
   - Include solutions and documentation links
   - Use consistent formatting with chalk

2. **Pre-flight Validation**
   - Create comprehensive validator that runs before build
   - Check all prerequisites in one command
   - Provide summary of what's ready and what's missing

3. **Setup Documentation**
   - Create detailed SETUP.md
   - Add troubleshooting section to README
   - Include common error scenarios

4. **Interactive Setup**
   - Optional wizard for first-time setup
   - Prompts for database configuration
   - Automatic .env file creation

### Dependencies

**New Dependencies** (all already available in project):
- chalk - For colored console output (already installed)
- prompts - For interactive CLI (already installed)
- semver - For version checking (already installed)

**No additional dependencies required**

## Security Considerations

1. **Environment File Protection**
   - Ensure .env is in .gitignore (already configured)
   - Warn users not to commit credentials
   - Provide .env.example without sensitive data

2. **Database Credentials**
   - Validate URL format but don't log credentials
   - Mask passwords in error messages
   - Use secure connection strings

3. **Default Credentials**
   - Document that default admin/umami should be changed
   - Add warning message after first build
   - Consider adding password change prompt

## Performance Considerations

1. **Validation Speed**
   - Run checks in parallel where possible
   - Cache validation results during setup
   - Skip expensive checks if earlier ones fail

2. **Build Optimization**
   - Use Turbo mode for development (already configured)
   - Leverage Next.js caching
   - Document build time expectations

## Future Enhancements

1. **Docker Setup Validation**
   - Validate Docker and Docker Compose installation
   - Check docker-compose.yml configuration
   - Verify container health

2. **Database Migration Validation**
   - Check migration status
   - Warn about pending migrations
   - Provide rollback guidance

3. **Health Check Endpoint**
   - Add /api/health endpoint
   - Check database connectivity
   - Verify all services are operational

4. **Setup Telemetry**
   - Track common setup errors (anonymously)
   - Improve documentation based on data
   - Identify pain points in setup process
