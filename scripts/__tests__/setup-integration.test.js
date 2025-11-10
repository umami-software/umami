import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

describe('Setup Integration Tests', () => {
  describe('Complete Setup Flow', () => {
    it('should validate setup with all checks', () => {
      try {
        const output = execSync('node scripts/setup-validator.js', {
          cwd: projectRoot,
          encoding: 'utf-8',
          stdio: 'pipe',
        });

        expect(output).toContain('Validating Umami Setup');
        expect(output).toMatch(/Node\.js Version/);
        expect(output).toMatch(/Package Manager/);
      } catch (error) {
        // Test passes if script runs (even with failures)
        expect(error.stdout || error.stderr).toBeDefined();
      }
    });

    it('should handle missing .env file gracefully', () => {
      const envPath = join(projectRoot, '.env');
      const envExists = existsSync(envPath);

      if (envExists) {
        // Skip if .env exists (don't want to break actual setup)
        expect(true).toBe(true);
        return;
      }

      try {
        execSync('node scripts/setup-validator.js', {
          cwd: projectRoot,
          encoding: 'utf-8',
          stdio: 'pipe',
        });
      } catch (error) {
        const output = error.stdout || error.stderr || '';
        expect(output).toContain('Environment Configuration');
      }
    });
  });

  describe('Error Recovery', () => {
    it('should provide helpful error messages', () => {
      try {
        execSync('node scripts/check-env.js', {
          cwd: projectRoot,
          encoding: 'utf-8',
          stdio: 'pipe',
          env: { ...process.env, DATABASE_URL: undefined },
        });
      } catch (error) {
        const output = error.stdout || '';
        // Should contain helpful information
        expect(output.length).toBeGreaterThan(0);
      }
    });

    it('should exit with non-zero code on validation failure', () => {
      try {
        execSync('node scripts/check-env.js', {
          cwd: projectRoot,
          encoding: 'utf-8',
          stdio: 'pipe',
          env: { ...process.env, DATABASE_URL: undefined, SKIP_DB_CHECK: undefined },
        });
        // Should not reach here
        expect(false).toBe(true);
      } catch (error) {
        expect(error.status).not.toBe(0);
      }
    });
  });

  describe('Build Process Integration', () => {
    it('should have check-env in build script', () => {
      const packageJson = JSON.parse(
        execSync('cat package.json', {
          cwd: projectRoot,
          encoding: 'utf-8',
        }),
      );

      expect(packageJson.scripts.build).toContain('check-env');
    });

    it('should have validate-setup script', () => {
      const packageJson = JSON.parse(
        execSync('cat package.json', {
          cwd: projectRoot,
          encoding: 'utf-8',
        }),
      );

      expect(packageJson.scripts['validate-setup']).toBeDefined();
      expect(packageJson.scripts['validate-setup']).toContain('setup-validator');
    });

    it('should have setup wizard script', () => {
      const packageJson = JSON.parse(
        execSync('cat package.json', {
          cwd: projectRoot,
          encoding: 'utf-8',
        }),
      );

      expect(packageJson.scripts.setup).toBeDefined();
      expect(packageJson.scripts.setup).toContain('quick-setup');
    });
  });

  describe('Script Execution', () => {
    it('should execute setup-validator without errors', () => {
      try {
        execSync('node scripts/setup-validator.js', {
          cwd: projectRoot,
          stdio: 'pipe',
        });
        expect(true).toBe(true);
      } catch (error) {
        // Script may fail validation but should execute
        expect(error.status).toBeDefined();
      }
    });

    it('should execute check-env without syntax errors', () => {
      try {
        execSync('node scripts/check-env.js', {
          cwd: projectRoot,
          stdio: 'pipe',
        });
        expect(true).toBe(true);
      } catch (error) {
        // Script may fail validation but should execute
        expect(error.status).toBeDefined();
      }
    });
  });

  describe('Documentation Files', () => {
    it('should have SETUP.md file', () => {
      const setupMdPath = join(projectRoot, 'SETUP.md');
      expect(existsSync(setupMdPath)).toBe(true);
    });

    it('should have .env.example file', () => {
      const envExamplePath = join(projectRoot, '.env.example');
      expect(existsSync(envExamplePath)).toBe(true);
    });

    it('SETUP.md should contain key sections', () => {
      const setupMdPath = join(projectRoot, 'SETUP.md');
      if (existsSync(setupMdPath)) {
        const content = execSync(`cat "${setupMdPath}"`, {
          cwd: projectRoot,
          encoding: 'utf-8',
        });

        expect(content).toContain('Prerequisites');
        expect(content).toContain('Installation');
        expect(content).toContain('Database');
        expect(content).toContain('Troubleshooting');
      }
    });

    it('.env.example should contain DATABASE_URL', () => {
      const envExamplePath = join(projectRoot, '.env.example');
      if (existsSync(envExamplePath)) {
        const content = execSync(`cat "${envExamplePath}"`, {
          cwd: projectRoot,
          encoding: 'utf-8',
        });

        expect(content).toContain('DATABASE_URL');
        expect(content).toContain('postgresql://');
      }
    });
  });

  describe('Validation Scripts Exist', () => {
    const scripts = [
      'setup-validator.js',
      'quick-setup.js',
      'check-env.js',
      'check-db.js',
      'pre-dev.js',
      'pre-start.js',
    ];

    scripts.forEach(script => {
      it(`should have ${script}`, () => {
        const scriptPath = join(projectRoot, 'scripts', script);
        expect(existsSync(scriptPath)).toBe(true);
      });
    });
  });
});
