const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const isCI = require('is-ci');
const pkg = require('../package.json');

const dest = path.resolve(__dirname, '../.next/cache/umami.json');
const url = 'https://telemetry.umami.is/api/collect';

async function sendTelemetry(action) {
  let json = {};

  try {
    json = await fs.readJSON(dest);
  } catch {
    // Ignore
  }

  try {
    await fs.writeJSON(dest, { version: pkg.version });
  } catch {
    // Ignore
  }

  const { default: isDocker } = await import('is-docker');
  const { default: fetch } = await import('node-fetch');
  const upgrade = json.version !== undefined && json.version !== pkg.version;

  const payload = {
    action,
    version: pkg.version,
    node: process.version,
    platform: os.platform(),
    arch: os.arch(),
    os: `${os.type()} (${os.version()})`,
    docker: isDocker(),
    ci: isCI,
    prev: json.version,
    upgrade,
  };

  try {
    await fetch(url, {
      method: 'post',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Ignore
  }
}

module.exports = {
  sendTelemetry,
};
