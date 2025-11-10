# Requirements Document

## Introduction

This document outlines the requirements for setting up and configuring the Umami analytics platform for local development. Umami is a privacy-focused web analytics application built with Next.js that requires proper environment configuration, database setup, and build processes to run successfully. The system must provide clear setup instructions, validate configurations, and ensure all dependencies are properly installed and configured.

## Glossary

- **Umami System**: The complete web analytics application including frontend, backend, and database components
- **Environment Configuration**: The .env file containing database connection strings and application settings
- **Database Connection**: PostgreSQL database connection required for storing analytics data
- **Build Process**: The compilation and preparation steps required before running the application
- **Development Server**: The local Next.js server running on port 3001 for development purposes
- **Production Build**: The optimized build of the application for deployment

## Requirements

### Requirement 1

**User Story:** As a developer, I want to set up the Umami project from scratch, so that I can run the application locally for development

#### Acceptance Criteria

1. WHEN a developer clones the repository, THE Umami System SHALL provide clear documentation on required dependencies
2. THE Umami System SHALL validate that Node.js version 18.18 or newer is installed
3. WHEN dependencies are missing, THE Umami System SHALL display informative error messages indicating which dependencies need to be installed
4. THE Umami System SHALL support installation using pnpm package manager
5. WHEN the installation completes successfully, THE Umami System SHALL confirm all packages are installed without errors

### Requirement 2

**User Story:** As a developer, I want to configure the database connection, so that the application can store and retrieve analytics data

#### Acceptance Criteria

1. THE Umami System SHALL require a DATABASE_URL environment variable in the .env file
2. WHEN the .env file is missing, THE Umami System SHALL provide clear instructions on creating it
3. THE Umami System SHALL support PostgreSQL version 12.14 or newer as the database
4. WHEN an invalid database connection string is provided, THE Umami System SHALL display a descriptive error message
5. THE Umami System SHALL validate the database connection before attempting to run migrations

### Requirement 3

**User Story:** As a developer, I want to build the application, so that all necessary assets and database tables are created

#### Acceptance Criteria

1. THE Umami System SHALL execute the build process using the "pnpm run build" command
2. WHEN building for the first time, THE Umami System SHALL create all required database tables automatically
3. THE Umami System SHALL generate a default admin user with username "admin" and password "umami"
4. THE Umami System SHALL build the tracking script during the build process
5. WHEN the build fails, THE Umami System SHALL display specific error messages indicating the failure point
6. THE Umami System SHALL validate environment variables before starting the build process

### Requirement 4

**User Story:** As a developer, I want to run the development server, so that I can test changes in real-time

#### Acceptance Criteria

1. THE Umami System SHALL start the development server on port 3001 using the "pnpm run dev" command
2. WHEN the development server starts successfully, THE Umami System SHALL display the URL where the application is accessible
3. THE Umami System SHALL enable hot-reload functionality for code changes during development
4. WHEN the database is not accessible, THE Umami System SHALL display a connection error before starting the server
5. THE Umami System SHALL use Turbo mode for faster development builds

### Requirement 5

**User Story:** As a developer, I want to run the production build, so that I can verify the application works in production mode

#### Acceptance Criteria

1. THE Umami System SHALL start the production server using the "pnpm run start" command
2. WHEN starting in production mode, THE Umami System SHALL require a completed build
3. THE Umami System SHALL serve the application on port 3000 by default in production mode
4. WHEN the build artifacts are missing, THE Umami System SHALL display an error message instructing to run the build command first
5. THE Umami System SHALL validate that all required environment variables are present before starting

### Requirement 6

**User Story:** As a developer, I want automated setup validation, so that I can quickly identify configuration issues

#### Acceptance Criteria

1. THE Umami System SHALL provide a check-env script that validates all required environment variables
2. THE Umami System SHALL provide a check-db script that validates database connectivity
3. WHEN environment variables are missing, THE Umami System SHALL list all missing variables
4. WHEN the database connection fails, THE Umami System SHALL provide troubleshooting guidance
5. THE Umami System SHALL validate the database schema matches the expected version
