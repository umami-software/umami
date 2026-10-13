/* eslint-disable no-console */
import 'dotenv/config';
import { collectEnvErrors } from './env-checks.js';

function reportErrors(errors) {
  if (!errors.length) {
    return;
  }

  console.log('Environment configuration is incomplete:');
  for (const error of errors) {
    console.log(' - ', error);
  }
  process.exit(1);
}

reportErrors(collectEnvErrors(process.env));
