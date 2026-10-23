import 'dotenv/config';
import cli from 'next/dist/cli/next-start.js';

cli.nextStart({
  port: process.env.PORT || 3000,
  // HOSTNAME is reserved by the OS/container runtime and can be overwritten
  // outside our control (e.g. Podman sets it to the pod's own hostname), so
  // bind-address overrides go through UMAMI_HOST instead.
  hostname: process.env.UMAMI_HOST || '0.0.0.0',
});
