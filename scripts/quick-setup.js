/* eslint-disable no-console */
import { execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import chalk from 'chalk';
import prompts from 'prompts';
import { checkNodeVersion, checkPackageManager } from './setup-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Display welcome message
 */
function displayWelcome() {
  console.clear();
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║                                        ║'));
  console.log(chalk.bold.cyan('║     Welcome to Umami Setup Wizard      ║'));
  console.log(chalk.bold.cyan('║                                        ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════╝\n'));
  console.log(
    chalk.gray('This wizard will guide you through setting up Umami for local development.\n'),
  );
}

/**
 * Main setup function
 */
async function quickSetup() {
  displayWelcome();

  try {
    // Step 1: Check prerequisites
    console.log(chalk.bold.yellow('Step 1: Checking Prerequisites\n'));
    await checkPrerequisites();

    // Step 2: Configure environment
    console.log(chalk.bold.yellow('\nStep 2: Database Configuration\n'));
    const dbConfig = await promptDatabaseConfig();

    // Step 3: Create .env file
    console.log(chalk.bold.yellow('\nStep 3: Creating Environment File\n'));
    await createEnvFile(dbConfig);

    // Step 4: Install dependencies
    console.log(chalk.bold.yellow('\nStep 4: Installing Dependencies\n'));
    const shouldInstall = await promptInstallDependencies();
    if (shouldInstall) {
      await installDependencies();
    }

    // Step 5: Validate database
    console.log(chalk.bold.yellow('\nStep 5: Validating Database\n'));
    await validateDatabase();

    // Step 6: Build application
    console.log(chalk.bold.yellow('\nStep 6: Building Application\n'));
    const shouldBuild = await promptBuild();
    if (shouldBuild) {
      await runBuild();
    }

    // Step 7: Display completion summary
    displayCompletionSummary(shouldBuild);
  } catch (error) {
    if (error.message === 'Setup cancelled') {
      console.log(chalk.yellow('\n⚠️  Setup cancelled by user.\n'));
      process.exit(0);
    }
    console.error(chalk.red.bold('\n❌ Setup failed:'), error.message);
    console.log(chalk.cyan('\nPlease fix the error and run the setup wizard again.\n'));
    process.exit(1);
  }
}

/**
 * Prompt for database configuration
 */
async function promptDatabaseConfig() {
  console.log(chalk.gray('Please provide your PostgreSQL database connection details:\n'));

  const response = await prompts(
    [
      {
        type: 'text',
        name: 'host',
        message: 'Database host:',
        initial: 'localhost',
      },
      {
        type: 'number',
        name: 'port',
        message: 'Database port:',
        initial: 5432,
      },
      {
        type: 'text',
        name: 'database',
        message: 'Database name:',
        initial: 'umami',
      },
      {
        type: 'text',
        name: 'username',
        message: 'Database username:',
        initial: 'postgres',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Database password:',
      },
    ],
    {
      onCancel: () => {
        throw new Error('Setup cancelled');
      },
    },
  );

  // Construct DATABASE_URL
  const databaseUrl = `postgresql://${response.username}:${response.password}@${response.host}:${response.port}/${response.database}`;

  console.log(chalk.cyan('\n📝 Connection string:'));
  // Mask password in display
  const maskedUrl = databaseUrl.replace(/:([^@]+)@/, ':****@');
  console.log(chalk.gray(maskedUrl));

  // Test connection
  console.log(chalk.cyan('\n🔍 Testing database connection...'));

  try {
    // Set temporary env var for testing
    process.env.DATABASE_URL = databaseUrl;

    // Try to connect using psql
    execSync(`psql "${databaseUrl}" -c "SELECT version();"`, { stdio: 'pipe' });

    console.log(chalk.green('✓ Database connection successful!'));
    return { databaseUrl, ...response };
  } catch (error) {
    console.log(chalk.red('✗ Database connection failed!'));
    console.log(chalk.gray(`Error: ${error.message}`));
    console.log(chalk.yellow('\n💡 Common issues:'));
    console.log('  - PostgreSQL service is not running');
    console.log('  - Incorrect username or password');
    console.log('  - Database does not exist');
    console.log('  - Host or port is incorrect\n');

    const retry = await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Would you like to try again?',
      initial: true,
    });

    if (retry.value) {
      return promptDatabaseConfig();
    } else {
      throw new Error('Database connection failed');
    }
  }
}

/**
 * Create .env file with database configuration
 */
async function createEnvFile(dbConfig) {
  const envPath = join(projectRoot, '.env');

  const envContent = `# Umami Environment Configuration
# Generated by setup wizard on ${new Date().toISOString()}

# Database Configuration (Required)
DATABASE_URL=${dbConfig.databaseUrl}

# Optional Configuration
# Uncomment and configure as needed

# BASE_PATH=/analytics
# TRACKER_SCRIPT_NAME=custom-script.js
# FORCE_SSL=1
# DEFAULT_LOCALE=en-US

# For more options, see .env.example
`;

  try {
    await writeFile(envPath, envContent, 'utf-8');
    console.log(chalk.green('✓ .env file created successfully'));
    console.log(chalk.gray(`  Location: ${envPath}\n`));

    // Confirm with user
    const confirm = await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Would you like to add optional configuration now?',
      initial: false,
    });

    if (confirm.value) {
      console.log(chalk.cyan('\n📝 You can edit the .env file to add optional configuration.'));
      console.log(chalk.gray('See .env.example for all available options.\n'));
    }
  } catch (err) {
    console.log(chalk.red('✗ Failed to create .env file'));
    throw new Error(`Failed to create .env file: ${err.message}`);
  }
}

/**
 * Prompt to install dependencies
 */
async function promptInstallDependencies() {
  const response = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Install dependencies now? (This may take a few minutes)',
    initial: true,
  });

  return response.value;
}

/**
 * Install dependencies using pnpm
 */
async function installDependencies() {
  console.log(chalk.cyan('\n📦 Installing dependencies...\n'));

  try {
    execSync('pnpm install', {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    console.log(chalk.green('\n✓ Dependencies installed successfully'));
  } catch (err) {
    console.log(chalk.red('\n✗ Failed to install dependencies'));
    console.log(chalk.gray(`Error: ${err.message}`));
    throw new Error('Dependency installation failed');
  }
}

/**
 * Validate database connection
 */
async function validateDatabase() {
  console.log(chalk.cyan('🔍 Validating database configuration...\n'));

  try {
    execSync('node scripts/check-db.js', {
      cwd: projectRoot,
      stdio: 'inherit',
    });
  } catch (err) {
    console.log(chalk.red('\n✗ Database validation failed'));
    console.log(chalk.gray(`Error: ${err.message}`));
    throw new Error('Database validation failed');
  }
}

/**
 * Prompt to build application
 */
async function promptBuild() {
  const response = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Build the application now? (This may take several minutes)',
    initial: true,
  });

  return response.value;
}

/**
 * Run build process
 */
async function runBuild() {
  console.log(chalk.cyan('\n🔨 Building application...\n'));
  console.log(chalk.gray('This will:'));
  console.log(chalk.gray('  - Generate Prisma client'));
  console.log(chalk.gray('  - Run database migrations'));
  console.log(chalk.gray('  - Create database tables'));
  console.log(chalk.gray('  - Build tracking script'));
  console.log(chalk.gray('  - Build Next.js application\n'));

  try {
    execSync('pnpm run build', {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    console.log(chalk.green('\n✓ Build completed successfully'));
    console.log(chalk.yellow('\n⚠️  Important: Default admin credentials created:'));
    console.log(chalk.cyan('   Username: admin'));
    console.log(chalk.cyan('   Password: umami'));
    console.log(chalk.yellow('   Please change this password after first login!\n'));
  } catch (err) {
    console.log(chalk.red('\n✗ Build failed'));
    console.log(chalk.gray(`Error: ${err.message}`));
    throw new Error('Build process failed');
  }
}

/**
 * Display completion summary
 */
function displayCompletionSummary(buildCompleted) {
  console.log(chalk.bold.green('\n╔════════════════════════════════════════╗'));
  console.log(chalk.bold.green('║                                        ║'));
  console.log(chalk.bold.green('║     ✅ Setup Completed Successfully!    ║'));
  console.log(chalk.bold.green('║                                        ║'));
  console.log(chalk.bold.green('╚════════════════════════════════════════╝\n'));

  console.log(chalk.bold.cyan('📋 Next Steps:\n'));

  if (buildCompleted) {
    console.log(chalk.green('1. Start the development server:'));
    console.log(chalk.cyan('   pnpm run dev\n'));

    console.log(chalk.green('2. Open your browser and navigate to:'));
    console.log(chalk.cyan('   http://localhost:3001\n'));

    console.log(chalk.green('3. Log in with default credentials:'));
    console.log(chalk.cyan('   Username: admin'));
    console.log(chalk.cyan('   Password: umami'));
    console.log(chalk.yellow('   ⚠️  Change this password immediately!\n'));

    console.log(chalk.green('4. Add your first website and start tracking!\n'));
  } else {
    console.log(chalk.green('1. Build the application:'));
    console.log(chalk.cyan('   pnpm run build\n'));

    console.log(chalk.green('2. Start the development server:'));
    console.log(chalk.cyan('   pnpm run dev\n'));

    console.log(chalk.green('3. Open your browser and navigate to:'));
    console.log(chalk.cyan('   http://localhost:3001\n'));
  }

  console.log(chalk.bold.cyan('📚 Additional Resources:\n'));
  console.log(chalk.gray('  • Documentation: https://umami.is/docs'));
  console.log(chalk.gray('  • Setup Guide: See SETUP.md in project root'));
  console.log(chalk.gray('  • Community: https://umami.is/discord'));
  console.log(chalk.gray('  • GitHub: https://github.com/umami-software/umami\n'));

  console.log(chalk.bold.cyan('💡 Helpful Commands:\n'));
  console.log(chalk.gray('  • Validate setup: node scripts/setup-validator.js'));
  console.log(chalk.gray('  • Check database: node scripts/check-db.js'));
  console.log(chalk.gray('  • Development mode: pnpm run dev'));
  console.log(chalk.gray('  • Production mode: pnpm run start\n'));

  console.log(chalk.green('Happy tracking! 🎉\n'));
}

/**
 * Check prerequisites (Node.js and pnpm)
 */
async function checkPrerequisites() {
  const nodeCheck = await checkNodeVersion();
  const pnpmCheck = await checkPackageManager();

  console.log(
    nodeCheck.status === 'pass'
      ? chalk.green(`✓ ${nodeCheck.message}`)
      : chalk.red(`✗ ${nodeCheck.message}`),
  );

  console.log(
    pnpmCheck.status === 'pass'
      ? chalk.green(`✓ ${pnpmCheck.message}`)
      : chalk.red(`✗ ${pnpmCheck.message}`),
  );

  if (nodeCheck.status === 'fail') {
    console.log(chalk.yellow(`\n💡 ${nodeCheck.solution}`));
    if (nodeCheck.documentation) {
      console.log(chalk.blue(`📖 ${nodeCheck.documentation}`));
    }
    throw new Error('Node.js version requirement not met');
  }

  if (pnpmCheck.status === 'fail') {
    console.log(chalk.yellow(`\n💡 ${pnpmCheck.solution}`));
    if (pnpmCheck.documentation) {
      console.log(chalk.blue(`📖 ${pnpmCheck.documentation}`));
    }
    throw new Error('pnpm not installed');
  }

  console.log(chalk.green('\n✅ All prerequisites met!'));
}

export { quickSetup };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  quickSetup();
}
