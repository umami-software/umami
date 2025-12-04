#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Umami Sample Data Generator
 *
 * Generates realistic analytics data for local development and testing.
 * Creates two demo websites:
 *   - Demo Blog: Low traffic (~100 sessions/month)
 *   - Demo SaaS: Average traffic (~500 sessions/day)
 *
 * Usage:
 *   npm run seed-data              # Generate 30 days of data
 *   npm run seed-data -- --days 90 # Generate 90 days of data
 *   npm run seed-data -- --clear   # Clear existing demo data first
 *   npm run seed-data -- --verbose # Show detailed progress
 */

import { seed, type SeedConfig } from './seed/index.js';

function parseArgs(): SeedConfig {
  const args = process.argv.slice(2);

  const config: SeedConfig = {
    days: 30,
    clear: false,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--days' && args[i + 1]) {
      config.days = parseInt(args[i + 1], 10);
      if (isNaN(config.days) || config.days < 1) {
        console.error('Error: --days must be a positive integer');
        process.exit(1);
      }
      i++;
    } else if (arg === '--clear') {
      config.clear = true;
    } else if (arg === '--verbose' || arg === '-v') {
      config.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg.startsWith('--days=')) {
      config.days = parseInt(arg.split('=')[1], 10);
      if (isNaN(config.days) || config.days < 1) {
        console.error('Error: --days must be a positive integer');
        process.exit(1);
      }
    }
  }

  return config;
}

function printHelp(): void {
  console.log(`
Umami Sample Data Generator

Generates realistic analytics data for local development and testing.

Usage:
  npm run seed-data [options]

Options:
  --days <number>    Number of days of data to generate (default: 30)
  --clear            Clear existing demo data before generating
  --verbose, -v      Show detailed progress
  --help, -h         Show this help message

Examples:
  npm run seed-data                   # Generate 30 days of data
  npm run seed-data -- --days 90      # Generate 90 days of data
  npm run seed-data -- --clear        # Clear existing demo data first
  npm run seed-data -- --days 7 -v    # Generate 7 days with verbose output

Generated Sites:
  - Demo Blog:  Low traffic (~90 sessions/month)
  - Demo SaaS:  Average traffic (~500 sessions/day) with revenue tracking

Note:
  This script is blocked from running in production environments
  (NODE_ENV=production or cloud platforms like Vercel/Netlify/Railway).
`);
}

function checkEnvironment(): void {
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv === 'production') {
    console.error('\nError: seed-data cannot run in production environment.');
    console.error('This script is only for local development and testing.\n');
    process.exit(1);
  }

  if (process.env.VERCEL || process.env.NETLIFY || process.env.RAILWAY_ENVIRONMENT) {
    console.error('\nError: seed-data cannot run in cloud environments.');
    console.error('This script is only for local development and testing.\n');
    process.exit(1);
  }
}

async function main(): Promise<void> {
  console.log('\nUmami Sample Data Generator\n');

  checkEnvironment();

  const config = parseArgs();

  try {
    await seed(config);
  } catch (error) {
    console.error('\nError generating seed data:', error);
    process.exit(1);
  }
}

main();
