import 'dotenv/config';
import { sendTelemetry } from './telemetry';

async function run() {
  if (!process.env.DISABLE_TELEMETRY) {
    await sendTelemetry('build');
  }
}

run();
