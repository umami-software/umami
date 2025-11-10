/* eslint-disable no-console */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import chalk from 'chalk';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log(chalk.bold.cyan('\n🚀 Starting Umami Production Server...\n'));

// Check if build exists
const nextBuildPath = join(projectRoot, '.next');
if (!existsSync(nextBuildPath)) {
  console.log(chalk.red.bold('❌ Build artifacts not found!\n'));
  console.log(chalk.yellow('💡 Solution:'));
  console.log(chalk.cyan('   Run the build command first: pnpm run build\n'));
  process.exit(1);
}

console.log(chalk.green('✓ Build artifacts found'));

// Check environment variables
if (!process.env.DATABASE_URL) {
  console.log(chalk.red.bold('\n❌ DATABASE_URL is not set!\n'));
  console.log(chalk.yellow('💡 Solution:'));
  console.log(chalk.cyan('   Ensure .env file exists with DATABASE_URL configured\n'));
  process.exit(1);
}

console.log(chalk.green('✓ Environment variables configured'));

// Check database connectivity (optional, can be skipped)
if (!process.env.SKIP_DB_CHECK) {
  try {
    const { execSync } = await import('node:child_process');
    execSync('node scripts/check-db.js', { stdio: 'pipe' });
    console.log(chalk.green('✓ Database connection verified'));
  } catch (err) {
    console.log(chalk.red('✗ Database connection failed'));
    console.log(chalk.gray(`Error: ${err.message}`));
    console.log(chalk.yellow('\n⚠️  Warning: Database is not accessible'));
    console.log(chalk.gray('The server will start but may not function correctly.\n'));
  }
}

console.log(chalk.green.bold('\n✅ Pre-start validation passed!\n'));
console.log(chalk.cyan('Starting Next.js production server...\n'));
