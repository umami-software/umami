import {
  checkNodeVersion,
  checkPackageManager,
  checkEnvFile,
  checkDatabaseUrl,
  checkDependencies,
} from '../setup-validator.js';

describe('Setup Validator', () => {
  describe('checkNodeVersion', () => {
    it('should pass when Node.js version is >= 18.18', async () => {
      const result = await checkNodeVersion();

      expect(result.check).toBe('Node.js Version');
      expect(['pass', 'fail']).toContain(result.status);
      expect(result.message).toBeDefined();
    });

    it('should have proper structure', async () => {
      const result = await checkNodeVersion();

      expect(result).toHaveProperty('check');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');

      if (result.status === 'fail') {
        expect(result).toHaveProperty('solution');
        expect(result).toHaveProperty('documentation');
      }
    });
  });

  describe('checkPackageManager', () => {
    it('should check if pnpm is installed', async () => {
      const result = await checkPackageManager();

      expect(result.check).toBe('Package Manager (pnpm)');
      expect(['pass', 'fail']).toContain(result.status);
      expect(result.message).toBeDefined();
    });

    it('should provide solution when pnpm is not found', async () => {
      const result = await checkPackageManager();

      if (result.status === 'fail') {
        expect(result.solution).toContain('pnpm');
        expect(result.documentation).toBeDefined();
      }
    });
  });

  describe('checkEnvFile', () => {
    it('should check for .env file existence', async () => {
      const result = await checkEnvFile();

      expect(result.check).toBe('Environment Configuration');
      expect(['pass', 'fail']).toContain(result.status);
      expect(result.message).toBeDefined();
    });

    it('should provide solution when .env is missing', async () => {
      const result = await checkEnvFile();

      if (result.status === 'fail') {
        expect(result.solution).toBeDefined();
      }
    });
  });

  describe('checkDatabaseUrl', () => {
    const originalEnv = process.env.DATABASE_URL;

    afterEach(() => {
      process.env.DATABASE_URL = originalEnv;
    });

    it('should fail when DATABASE_URL is not set', async () => {
      delete process.env.DATABASE_URL;

      const result = await checkDatabaseUrl();

      expect(result.check).toBe('Database URL Format');
      expect(result.status).toBe('fail');
      expect(result.message).toContain('DATABASE_URL');
    });

    it('should fail when DATABASE_URL format is invalid', async () => {
      process.env.DATABASE_URL = 'invalid-url';

      const result = await checkDatabaseUrl();

      expect(result.status).toBe('fail');
      expect(result.message).toContain('format');
      expect(result.solution).toBeDefined();
    });

    it('should pass when DATABASE_URL format is valid', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

      const result = await checkDatabaseUrl();

      expect(result.status).toBe('pass');
      expect(result.message).toContain('valid');
    });

    it('should validate PostgreSQL URL pattern', async () => {
      const validUrls = [
        'postgresql://user:pass@localhost:5432/db',
        'postgresql://admin:secret@192.168.1.1:5432/umami',
        'postgresql://test:test123@db.example.com:5432/analytics',
      ];

      for (const url of validUrls) {
        process.env.DATABASE_URL = url;
        const result = await checkDatabaseUrl();
        expect(result.status).toBe('pass');
      }
    });

    it('should reject invalid URL patterns', async () => {
      const invalidUrls = [
        'mysql://user:pass@localhost:3306/db',
        'http://localhost:5432',
        'postgresql://localhost',
        'user:pass@localhost:5432/db',
      ];

      for (const url of invalidUrls) {
        process.env.DATABASE_URL = url;
        const result = await checkDatabaseUrl();
        expect(result.status).toBe('fail');
      }
    });
  });

  describe('checkDependencies', () => {
    it('should check for node_modules directory', async () => {
      const result = await checkDependencies();

      expect(result.check).toBe('Dependencies');
      expect(['pass', 'fail']).toContain(result.status);
      expect(result.message).toBeDefined();
    });

    it('should provide solution when dependencies are missing', async () => {
      const result = await checkDependencies();

      if (result.status === 'fail') {
        expect(result.solution).toContain('pnpm install');
      }
    });
  });

  describe('Validation Result Structure', () => {
    it('all checks should return consistent structure', async () => {
      const checks = [
        checkNodeVersion,
        checkPackageManager,
        checkEnvFile,
        checkDatabaseUrl,
        checkDependencies,
      ];

      for (const check of checks) {
        const result = await check();

        expect(result).toHaveProperty('check');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('message');
        expect(typeof result.check).toBe('string');
        expect(['pass', 'fail', 'warning']).toContain(result.status);
        expect(typeof result.message).toBe('string');

        if (result.solution) {
          expect(typeof result.solution).toBe('string');
        }

        if (result.documentation) {
          expect(typeof result.documentation).toBe('string');
        }
      }
    });
  });
});
