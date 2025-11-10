/* eslint-disable no-console */
import chalk from 'chalk';
import { validateSetup } from './setup-validator.js';

console.log(chalk.bold.cyan('\n🚀 Starting Umami Development Server...\n'));

try {
  const result = await validateSetup();

  if (result.overall === 'error') {
    console.log(chalk.red.bold('\n❌ Cannot start development server due to validation errors.\n'));
    console.log(chalk.cyan('Please fix the errors above and try again.\n'));
    process.exit(1);
  }

  if (result.overall === 'incomplete') {
    console.log(
      chalk.yellow.bold('\n⚠️  Starting with warnings. Some features may not work correctly.\n'),
    );
  }

  console.log(chalk.green.bold('✅ Validation passed! Starting Next.js development server...\n'));
} catch (error) {
  console.error(chalk.red.bold('\n❌ Pre-flight check failed:'), error.message);
  process.exit(1);
}
