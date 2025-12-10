import os from 'node:os';
import path from 'node:path';
import isCI from 'is-ci';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require(path.resolve(process.cwd(), 'package.json'));

const url = 'https://api.umami.is/v1/telemetry';

export async function sendTelemetry(type) {
  const { default: isDocker } = await import('is-docker');
  const { default: fetch } = await import('node-fetch');

  const data = {
    type,
    payload: {
      version: pkg.version,
      node: process.version,
      platform: os.platform(),
      arch: os.arch(),
      os: `${os.type()} ${os.version()}`,
      is_docker: isDocker(),
      is_ci: isCI,
    },
  };

  try {
    await fetch(url, {
      method: 'post',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch {
    // Ignore
  }
}
