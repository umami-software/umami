/* eslint-disable no-console */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import chalk from 'chalk';
import semver from 'semver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const MIN_NODE_VERSION = '18.18.0';

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {string} check - Name of the validation check
 * @property {'pass'|'fail'|'warning'} status - Status of the check
 * @property {string} message - Human-readable message
 * @property {string} [solution] - Suggested fix for failures
 * @property {string} [documentation] - Link to relevant docs
 */

/**
 * Check Node.js version
 * @returns {Promise<ValidationResult>}
 */
async function checkNodeVersion() {
  try {
    const currentVersion = process.version;
    const version = semver.clean(currentVersion);

    if (semver.gte(version, MIN_NODE_VERSION)) {
      return {
        check: 'Node.js Version',
        status: 'pass',
        message: `Node.js ${version} is installed (minimum: ${MIN_NODE_VERSION})`,
      };
    } else {
      return {
        check: 'Node.js Version',
        status: 'fail',
        message: `Node.js ${version} is installed, but ${MIN_NODE_VERSION} or newer is required`,
        solution: `Please upgrade Node.js to version ${MIN_NODE_VERSION} or newer`,
        documentation: 'https://nodejs.org/en/download/',
      };
    }
  } catch {
    return {
      check: 'Node.js Version',
      status: 'fail',
      message: 'Unable to determine Node.js version',
      solution: 'Ensure Node.js is properly installed',
      documentation: 'https://nodejs.org/en/download/',
    };
  }
}

/**
 * Check if pnpm is installed
 * @returns {Promise<ValidationResult>}
 */
async function checkPackageManager() {
  try {
    const version = execSync('pnpm --version', { encoding: 'utf-8' }).trim();

    return {
      check: 'Package Manager (pnpm)',
      status: 'pass',
      message: `pnpm ${version} is installed`,
    };
  } catch {
    return {
      check: 'Package Manager (pnpm)',
      status: 'fail',
      message: 'pnpm is not installed or not in PATH',
      solution: 'Install pnpm using: npm install -g pnpm',
      documentation: 'https://pnpm.io/installation',
    };
  }
}

/**
 * Check if .env file exists and has required variables
 * @returns {Promise<ValidationResult>}
 */
async function checkEnvFile() {
  const envPath = join(projectRoot, '.env');

  if (!existsSync(envPath)) {
    return {
      check: 'Environment Configuration',
      status: 'fail',
      message: '.env file not found',
      solution: 'Copy .env.example to .env and configure your database connection',
      documentation: 'See .env.example for template',
    };
  }

  try {
    const envContent = await readFile(envPath, 'utf-8');

    // Check for DATABASE_URL
    const hasDatabaseUrl = /^DATABASE_URL=/m.test(envContent);

    if (!hasDatabaseUrl) {
      return {
        check: 'Environment Configuration',
        status: 'fail',
        message: '.env file exists but DATABASE_URL is not defined',
        solution: 'Add DATABASE_URL to your .env file (see .env.example)',
      };
    }

    return {
      check: 'Environment Configuration',
      status: 'pass',
      message: '.env file exists with required variables',
    };
  } catch {
    return {
      check: 'Environment Configuration',
      status: 'fail',
      message: 'Unable to read .env file',
      solution: 'Ensure .env file has proper read permissions',
    };
  }
}

/**
 * Validate DATABASE_URL format
 * @returns {Promise<ValidationResult>}
 */
async function checkDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      check: 'Database URL Format',
      status: 'fail',
      message: 'DATABASE_URL environment variable is not set',
      solution: 'Set DATABASE_URL in your .env file',
    };
  }

  // Validate PostgreSQL URL format
  const postgresUrlPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;

  if (!postgresUrlPattern.test(databaseUrl)) {
    return {
      check: 'Database URL Format',
      status: 'fail',
      message: 'DATABASE_URL format is invalid',
      solution:
        'Use format: postgresql://username:password@host:port/database\nExample: postgresql://umami:mypassword@localhost:5432/umami',
    };
  }

  return {
    check: 'Database URL Format',
    status: 'pass',
    message: 'DATABASE_URL format is valid',
  };
}

/**
 * Check if dependencies are installed
 * @returns {Promise<ValidationResult>}
 */
async function checkDependencies() {
  const nodeModulesPath = join(projectRoot, 'node_modules');

  if (!existsSync(nodeModulesPath)) {
    return {
      check: 'Dependencies',
      status: 'fail',
      message: 'node_modules directory not found',
      solution: 'Run: pnpm install',
    };
  }

  // Check for key dependencies
  const keyDependencies = ['next', 'react', 'prisma', '@prisma/client'];
  const missingDeps = [];

  for (const dep of keyDependencies) {
    const depPath = join(nodeModulesPath, dep);
    if (!existsSync(depPath)) {
      missingDeps.push(dep);
    }
  }

  if (missingDeps.length > 0) {
    return {
      check: 'Dependencies',
      status: 'fail',
      message: `Missing key dependencies: ${missingDeps.join(', ')}`,
      solution: 'Run: pnpm install',
    };
  }

  return {
    check: 'Dependencies',
    status: 'pass',
    message: 'All key dependencies are installed',
  };
}

/**
 * Format a single validation result for display
 * @param {ValidationResult} result
 * @returns {string}
 */
function formatResult(result) {
  const statusIcon = {
    pass: chalk.green('✓'),
    fail: chalk.red('✗'),
    warning: chalk.yellow('⚠'),
  }[result.status];

  let output = `${statusIcon} ${chalk.bold(result.check)}: ${result.message}`;

  if (result.solution) {
    output += `\n  ${chalk.yellow('💡 Solution:')} ${result.solution}`;
  }

  if (result.documentation) {
    output += `\n  ${chalk.blue('📖 Documentation:')} ${result.documentation}`;
  }

  return output;
}

/**
 * Format all validation results
 * @param {ValidationResult[]} results
 * @returns {Object}
 */
function formatResults(results) {
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  const overall = failed > 0 ? 'error' : warnings > 0 ? 'incomplete' : 'ready';

  return {
    overall,
    passed,
    failed,
    warnings,
    results,
  };
}

/**
 * Main validation function
 * @returns {Promise<Object>}
 */
async function validateSetup() {
  console.log(chalk.bold.cyan('\n🔍 Validating Umami Setup...\n'));

  // Load environment variables
  try {
    const dotenv = await import('dotenv');
    dotenv.config({ path: join(projectRoot, '.env') });
  } catch {
    // dotenv might not be available yet
  }

  const checks = [
    { name: 'Node.js Version', fn: checkNodeVersion },
    { name: 'Package Manager', fn: checkPackageManager },
    { name: 'Environment File', fn: checkEnvFile },
    { name: 'Database URL', fn: checkDatabaseUrl },
    { name: 'Dependencies', fn: checkDependencies },
  ];

  const results = [];

  for (const check of checks) {
    try {
      const result = await check.fn();
      results.push(result);
      console.log(formatResult(result));

      // Early exit on critical failures
      if (result.status === 'fail' && ['Node.js Version', 'Package Manager'].includes(check.name)) {
        console.log(
          chalk.red.bold(
            '\n❌ Critical check failed. Please fix the above issue before continuing.\n',
          ),
        );
        break;
      }
    } catch (error) {
      results.push({
        check: check.name,
        status: 'fail',
        message: `Unexpected error: ${error.message}`,
      });
      console.log(formatResult(results[results.length - 1]));
    }
  }

  const summary = formatResults(results);

  console.log(chalk.bold('\n' + '='.repeat(60)));
  console.log(chalk.bold('Summary:'));
  console.log(`  ${chalk.green('Passed:')} ${summary.passed}`);
  console.log(`  ${chalk.red('Failed:')} ${summary.failed}`);
  console.log(`  ${chalk.yellow('Warnings:')} ${summary.warnings}`);
  console.log('='.repeat(60));

  if (summary.overall === 'ready') {
    console.log(
      chalk.green.bold('\n✅ Setup validation passed! You are ready to build and run Umami.\n'),
    );
    console.log(chalk.cyan('Next steps:'));
    console.log('  1. Run: pnpm run build');
    console.log('  2. Run: pnpm run dev (for development) or pnpm run start (for production)\n');
  } else if (summary.overall === 'incomplete') {
    console.log(chalk.yellow.bold('\n⚠️  Setup validation completed with warnings.\n'));
    console.log(chalk.cyan('Please review the warnings above and fix them if necessary.\n'));
  } else {
    console.log(chalk.red.bold('\n❌ Setup validation failed!\n'));
    console.log(chalk.cyan('Please fix the errors above and run validation again.\n'));
    process.exit(1);
  }

  return summary;
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateSetup().catch(error => {
    console.error(chalk.red.bold('\n❌ Validation error:'), error.message);
    process.exit(1);
  });
}

export {
  checkNodeVersion,
  checkPackageManager,
  checkEnvFile,
  checkDatabaseUrl,
  checkDependencies,
  validateSetup,
  formatResult,
  formatResults,
};
