import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewUsers } from '@/permissions';
import prisma from '@/lib/prisma';
import { CURRENT_VERSION, UPDATES_URL } from '@/lib/constants';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { statfs } from 'node:fs/promises';
import semver from 'semver';

interface DatabaseStatus {
  connected: boolean;
  type: string;
  error?: string;
}

interface StorageStatus {
  available: boolean;
  total: number;
  free: number;
  used: number;
  percentage: number;
  path: string;
  error?: string;
}

interface UpdateStatus {
  current: string;
  latest?: string;
  updateAvailable: boolean;
  error?: string;
}

interface SystemStatus {
  database: DatabaseStatus;
  storage: StorageStatus;
  updates: UpdateStatus;
}

async function checkDatabase(): Promise<DatabaseStatus> {
  try {
    const dbType = process.env.DATABASE_TYPE || 'postgresql';
    
    // Try to connect and run a simple query
    await prisma.client.$queryRaw`SELECT 1`;
    
    return {
      connected: true,
      type: dbType,
    };
  } catch (error: any) {
    return {
      connected: false,
      type: process.env.DATABASE_TYPE || 'unknown',
      error: error.message || 'Database connection failed',
    };
  }
}

async function checkStorage(): Promise<StorageStatus> {
  try {
    // Try to check storage for common paths
    const pathsToCheck = [
      process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).pathname : null,
      process.cwd(),
      '/',
    ].filter(Boolean) as string[];

    let path = pathsToCheck[0];
    
    // For PostgreSQL, try to get the data directory
    if (process.env.DATABASE_URL) {
      try {
        const dbUrl = new URL(process.env.DATABASE_URL);
        if (dbUrl.hostname === 'localhost' || dbUrl.hostname === '127.0.0.1') {
          // Try to get PostgreSQL data directory
          try {
            const pgDataDir = execSync('pg_config --sharedir', { encoding: 'utf-8', stdio: 'pipe' }).trim();
            path = join(pgDataDir, '../data');
          } catch {
            // Fallback to current directory
            path = process.cwd();
          }
        }
      } catch {
        path = process.cwd();
      }
    }

    // Check if path exists, if not use current directory
    if (!existsSync(path)) {
      path = process.cwd();
    }

    let total = 0;
    let free = 0;
    let used = 0;
    let percentage = 0;

    try {
      // Try to use statfs (Node.js 18.9.0+)
      const stats = await statfs(path);
      const blockSize = stats.bsize || 1;
      total = stats.blocks * blockSize;
      free = stats.bavail * blockSize;
      used = total - free;
      percentage = total > 0 ? Math.round((used / total) * 100) : 0;
    } catch {
      // Fallback: Try to use df command on Unix systems
      try {
        const dfOutput = execSync(`df -k "${path}"`, { encoding: 'utf-8', stdio: 'pipe' });
        const lines = dfOutput.trim().split('\n');
        if (lines.length > 1) {
          const parts = lines[1].split(/\s+/);
          if (parts.length >= 4) {
            total = parseInt(parts[1], 10) * 1024; // Convert from KB to bytes
            used = parseInt(parts[2], 10) * 1024;
            free = parseInt(parts[3], 10) * 1024;
            percentage = total > 0 ? Math.round((used / total) * 100) : 0;
          }
        }
      } catch {
        // If both methods fail, we can't determine storage
        throw new Error('Unable to determine storage usage');
      }
    }

    return {
      available: true,
      total,
      free,
      used,
      percentage,
      path,
    };
  } catch (error: any) {
    return {
      available: false,
      total: 0,
      free: 0,
      used: 0,
      percentage: 0,
      path: process.cwd(),
      error: error.message || 'Storage check failed',
    };
  }
}

async function checkUpdates(): Promise<UpdateStatus> {
  const current = CURRENT_VERSION || 'unknown';
  
  try {
    if (!UPDATES_URL) {
      return {
        current,
        updateAvailable: false,
        error: 'Updates URL not configured',
      };
    }

    // Use the same API format as the existing version check
    const response = await fetch(`${UPDATES_URL}?v=${current}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Umami',
      },
    });

    if (!response.ok) {
      // If API returns non-ok, don't treat it as an error - just show current version
      return {
        current,
        updateAvailable: false,
      };
    }

    const data = await response.json();
    
    // The API returns { latest, url } structure
    const latest = data?.latest || null;

    if (!latest) {
      // If no latest version in response, just show current version without error
      return {
        current,
        updateAvailable: false,
      };
    }

    // Use semver for proper version comparison
    const updateAvailable = semver.gt(latest, current);

    return {
      current,
      latest,
      updateAvailable,
    };
  } catch (error: any) {
    // Network errors or other issues - show current version without alarming error
    return {
      current,
      updateAvailable: false,
    };
  }
}

export async function GET(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  if (!(await canViewUsers(auth))) {
    return unauthorized();
  }

  const [database, storage, updates] = await Promise.all([
    checkDatabase(),
    checkStorage(),
    checkUpdates(),
  ]);

  const status: SystemStatus = {
    database,
    storage,
    updates,
  };

  return json(status);
}

