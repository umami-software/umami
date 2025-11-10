/* eslint-disable no-console */
import { spawn } from 'node:child_process';
import chalk from 'chalk';
import 'dotenv/config';

console.log(chalk.bold.cyan('\n🚀 Starting Umami Production Server...\n'));

// Start Next.js production server
const prodServer = spawn('next', ['start'], {
  stdio: 'inherit',
  shell: true,
});

prodServer.on('spawn', () => {
  setTimeout(() => {
    console.log(chalk.green.bold('\n✅ Production server is running!\n'));
    console.log(chalk.cyan('📍 Local:            http://localhost:3000'));
    console.log(chalk.cyan('📍 Network:          Use your local IP address\n'));

    console.log(chalk.gray('Environment:'));
    console.log(chalk.gray(`  • Mode: Production`));
    console.log(chalk.gray(`  • Database: Connected`));
    if (process.env.BASE_PATH) {
      console.log(chalk.gray(`  • Base Path: ${process.env.BASE_PATH}`));
    }
    console.log('');

    console.log(chalk.yellow.bold('⚠️  Security Reminders:\n'));
    console.log(chalk.yellow('  1. Change default admin password (admin/umami)'));
    console.log(chalk.yellow('  2. Use HTTPS in production (set FORCE_SSL=1)'));
    console.log(chalk.yellow('  3. Keep your DATABASE_URL secure'));
    console.log(chalk.yellow('  4. Regularly update dependencies\n'));

    console.log(chalk.gray('💡 Press Ctrl+C to stop the server\n'));
  }, 2000);
});

prodServer.on('error', error => {
  console.error(chalk.red.bold('\n❌ Failed to start production server:'), error.message);
  process.exit(1);
});

prodServer.on('exit', code => {
  if (code !== 0 && code !== null) {
    console.error(chalk.red.bold(`\n❌ Production server exited with code ${code}\n`));
    process.exit(code);
  }
});
