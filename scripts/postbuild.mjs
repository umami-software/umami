import 'dotenv/config';
import { sendTelemetry } from './telemetry.mjs';

async function run() {
  if (!process.env.DISABLE_TELEMETRY) {
    await sendTelemetry('build');
  }
}

run();
