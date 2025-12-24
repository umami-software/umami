import { readFile } from 'fs/promises';
import { join } from 'path';
import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';

let cachedVersion: string | null = null;

async function getVersion(): Promise<string> {
  if (cachedVersion) {
    return cachedVersion;
  }

  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const data = await readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(data);
    cachedVersion = packageJson.version || 'unknown';
  } catch (error) {
    cachedVersion = 'unknown';
  }

  return cachedVersion;
}

export async function GET(request: Request) {
  const { error } = await parseRequest(request, null, { skipAuth: true });

  if (error) {
    return error();
  }

  const version = await getVersion();

  return json({ version });
}
