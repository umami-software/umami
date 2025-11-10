/* eslint-disable no-console */
import 'dotenv/config';
import chalk from 'chalk';

/**
 * Variable descriptions and examples
 */
const variableInfo = {
  DATABASE_URL: {
    description: 'PostgreSQL database connection string',
    example: 'postgresql://username:password@localhost:5432/umami',
    required: true,
  },
  CLOUD_URL: {
    description: 'Umami Cloud URL',
    example: 'https://cloud.umami.is',
    required: false,
  },
  CLICKHOUSE_URL: {
    description: 'ClickHouse database URL (required when CLOUD_URL is set)',
    example: 'https://clickhouse.example.com',
    required: false,
  },
  REDIS_URL: {
    description: 'Redis connection URL (required when CLOUD_URL is set)',
    example: 'redis://localhost:6379',
    required: false,
  },
};

function checkMissing(vars) {
  const missing = vars.reduce((arr, key) => {
    if (!process.env[key]) {
      arr.push(key);
    }
    return arr;
  }, []);

  if (missing.length) {
    console.log(chalk.red.bold('\n❌ Environment Configuration Error\n'));
    console.log(chalk.yellow('The following environment variables are not defined:\n'));

    for (const item of missing) {
      const info = variableInfo[item] || {};
      console.log(chalk.red(`  ✗ ${item}`));

      if (info.description) {
        console.log(chalk.gray(`    Description: ${info.description}`));
      }

      if (info.example) {
        console.log(chalk.cyan(`    Example: ${info.example}`));
      }

      console.log('');
    }

    console.log(chalk.yellow.bold('💡 Solution:\n'));
    console.log("  1. Create a .env file in the project root if it doesn't exist");
    console.log('  2. Copy the template from .env.example:');
    console.log(chalk.cyan('     cp .env.example .env'));
    console.log('  3. Add the missing variables to your .env file\n');

    console.log(chalk.blue('📖 For more information, see .env.example or SETUP.md\n'));

    process.exit(1);
  }
}

// Check required variables based on configuration
if (!process.env.SKIP_DB_CHECK && !process.env.DATABASE_TYPE) {
  checkMissing(['DATABASE_URL']);
}

if (process.env.CLOUD_URL) {
  checkMissing(['CLOUD_URL', 'CLICKHOUSE_URL', 'REDIS_URL']);
}

// Success message
console.log(chalk.green('✓ Environment variables validated successfully\n'));
