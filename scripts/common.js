const { spawn } = require('child_process');

function getDatabase() {
  return process.env.DATABASE_URL.split(':')[0];
}

function runCommand(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args);

    child.stdout.on('data', data => process.stdout.write(data));

    child.stderr.on('data', data => process.stdout.write(data));

    child.on('error', err => reject(err));

    child.on('exit', (code, signal) => resolve({ code, signal }));
  });
}

function getNpmCommand() {
  return /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
}

module.exports = {
  getDatabase,
  runCommand,
  getNpmCommand,
};
