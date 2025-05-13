/* eslint-disable no-console */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const routesManifestPath = path.resolve(__dirname, '../.next/routes-manifest.json');
const originalPath = path.resolve(__dirname, '../.next/routes-manifest-orig.json');
const originalManifest = require(originalPath);

const basePath = originalManifest.basePath;

const API_PATH = basePath + '/api/:path*';
const TRACKER_SCRIPT = basePath + '/script.js';

const collectApiEndpoint = process.env.COLLECT_API_ENDPOINT;
const trackerScriptName = process.env.TRACKER_SCRIPT_NAME;

const headers = [];
const rewrites = [];

if (collectApiEndpoint) {
  const apiRoute = originalManifest.headers.find(route => route.source === API_PATH);
  const routeRegex = new RegExp(apiRoute.regex);

  const normalizedSource = basePath + collectApiEndpoint;

  rewrites.push({
    source: normalizedSource,
    destination: basePath + '/api/send',
  });

  if (!routeRegex.test(normalizedSource)) {
    headers.push({
      source: normalizedSource,
      headers: apiRoute.headers,
    });
  }
}

if (trackerScriptName) {
  const trackerRoute = originalManifest.headers.find(route => route.source === TRACKER_SCRIPT);

  const names = trackerScriptName?.split(',').map(name => name.trim());

  if (names) {
    names.forEach(name => {
      const normalizedSource = `${basePath}/${name.replace(/^\/+/, '')}`;

      rewrites.push({
        source: normalizedSource,
        destination: TRACKER_SCRIPT,
      });

      headers.push({
        source: normalizedSource,
        headers: trackerRoute.headers,
      });
    });
  }
}

const routesManifest = { ...originalManifest };

if (rewrites.length !== 0) {
  const { buildCustomRoute } = require('next/dist/lib/build-custom-route');

  const builtHeaders = headers.map(header => buildCustomRoute('header', header));
  const builtRewrites = rewrites.map(rewrite => buildCustomRoute('rewrite', rewrite));

  routesManifest.headers = [...originalManifest.headers, ...builtHeaders];
  routesManifest.rewrites = [...builtRewrites, ...originalManifest.rewrites];

  console.log('Using updated Next.js routes manifest');
} else {
  console.log('Using original Next.js routes manifest');
}

fs.writeFileSync(routesManifestPath, JSON.stringify(routesManifest, null, 2));
