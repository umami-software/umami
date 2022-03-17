require('dotenv').config();
const sendTelemetry = require('./telemetry');

async function run() {
  if (!process.env.TELEMETRY_DISABLE) {
    await sendTelemetry();
  }
}

run();
