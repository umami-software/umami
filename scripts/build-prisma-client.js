import esbuild from 'esbuild';

esbuild
  .build({
    entryPoints: ['src/generated/prisma/client.ts'], // Adjust this to your entry file
    bundle: true, // Bundle all files into one (optional)
    outfile: 'generated/prisma/client.js', // Output file
    platform: 'node', // For Node.js compatibility
    target: 'es2020', // Target version of Node.js
    format: 'esm', // Use ESM format
    sourcemap: true, // Optional: generates source maps for debugging
    external: [
      '../src/generated/prisma', // exclude generated client
      '@prisma/client', // just in case
      '.prisma/client',
    ], // Optional: Exclude external dependencies from bundling
  })
  .catch(() => process.exit(1));
