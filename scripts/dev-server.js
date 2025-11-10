/* eslint-disable no-console */
import { spawn } from 'node:child_process';
import chalk from 'chalk';

console.log(chalk.bold.cyan('\n🚀 Starting Umami Development Server...\n'));

// Start Next.js dev server
const devServer = spawn('next', ['dev', '-p', '3001', '--turbo'], {
  stdio: 'inherit',
  shell: true,
});

devServer.on('spawn', () => {
  setTimeout(() => {
    console.log(chalk.green.bold('\n✅ Development server is running!\n'));
    console.log(chalk.cyan('📍 Local:            http://localhost:3001'));
    console.log(chalk.cyan('📍 Network:          Use your local IP address\n'));
    console.log(chalk.gray('Features enabled:'));
    console.log(chalk.gray('  • Hot Module Replacement (HMR)'));
    console.log(chalk.gray('  • Turbo Mode for faster builds'));
    console.log(chalk.gray('  • Detailed error messages\n'));
    console.log(chalk.yellow('💡 Press Ctrl+C to stop the server\n'));
  }, 2000);
});

devServer.on('error', error => {
  console.error(chalk.red.bold('\n❌ Failed to start development server:'), error.message);
  process.exit(1);
});

devServer.on('exit', code => {
  if (code !== 0 && code !== null) {
    console.error(chalk.red.bold(`\n❌ Development server exited with code ${code}\n`));
    process.exit(code);
  }
});
