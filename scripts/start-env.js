import 'dotenv/config';
import cli from 'next/dist/cli/next-start.js';

cli.nextStart({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) || 3000 : 3000,
  hostname: process.env.HOSTNAME || '0.0.0.0',
});
