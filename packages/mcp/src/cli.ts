#!/usr/bin/env node
import { serveUmamiStdio } from './stdio';

try {
  serveUmamiStdio();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}
