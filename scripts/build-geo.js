/* eslint-disable no-console */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import https from 'https';
import { list } from 'tar';
import zlib from 'zlib';

if (process.env.SKIP_BUILD_GEO) {
  console.log('SKIP_BUILD_GEO is set. Skipping geo setup.');
  process.exit(0);
}

if (process.env.VERCEL && !process.env.BUILD_GEO) {
  console.log('Vercel environment detected. Skipping geo setup.');
  process.exit(0);
}

const db = 'GeoLite2-City';

// Support custom URL via environment variable
let url = process.env.GEO_DATABASE_URL;

// Fallback to default URLs if not provided
if (!url) {
  if (process.env.MAXMIND_LICENSE_KEY) {
    url =
      `https://download.maxmind.com/app/geoip_download` +
      `?edition_id=${db}&license_key=${process.env.MAXMIND_LICENSE_KEY}&suffix=tar.gz`;
  } else {
    url = `https://raw.githubusercontent.com/GitSquared/node-geolite2-redist/master/redist/${db}.tar.gz`;
  }
}

const dest = path.resolve(process.cwd(), 'geo');

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest);
}

// Check if URL points to a direct .mmdb file (already extracted)
const isDirectMmdb = url.endsWith('.mmdb');

// Download handler for compressed tar.gz files
const downloadCompressed = url =>
  new Promise(resolve => {
    https.get(url, res => {
      resolve(res.pipe(zlib.createGunzip({})).pipe(list()));
    });
  });

// Download handler for direct .mmdb files
const downloadDirect = (url, originalUrl) =>
  new Promise((resolve, reject) => {
    https.get(url, res => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadDirect(res.headers.location, originalUrl || url)
          .then(resolve)
          .catch(reject);
        return;
      }

      const filename = path.join(dest, path.basename(originalUrl || url));
      const fileStream = fs.createWriteStream(filename);

      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log('Saved geo database:', filename);
        resolve();
      });

      fileStream.on('error', e => {
        reject(e);
      });
    });
  });

// Execute download based on file type
if (isDirectMmdb) {
  downloadDirect(url).catch(e => {
    console.error('Failed to download geo database:', e);
    process.exit(1);
  });
} else {
  downloadCompressed(url)
    .then(
      res =>
        new Promise((resolve, reject) => {
          res.on('entry', entry => {
            if (entry.path.endsWith('.mmdb')) {
              const filename = path.join(dest, path.basename(entry.path));
              entry.pipe(fs.createWriteStream(filename));

              console.log('Saved geo database:', filename);
            }
          });

          res.on('error', e => {
            reject(e);
          });
          res.on('finish', () => {
            resolve();
          });
        }),
    )
    .catch(e => {
      console.error('Failed to download geo database:', e);
      process.exit(1);
    });
}

// ASN database, loaded at runtime only when IGNORE_ASN is set. It's optional, so a
// failed download logs a warning instead of failing the build.
const asnDb = 'GeoLite2-ASN';
const asnUrl = process.env.MAXMIND_LICENSE_KEY
  ? `https://download.maxmind.com/app/geoip_download` +
    `?edition_id=${asnDb}&license_key=${process.env.MAXMIND_LICENSE_KEY}&suffix=tar.gz`
  : `https://raw.githubusercontent.com/GitSquared/node-geolite2-redist/master/redist/${asnDb}.tar.gz`;

const skipAsn = e => console.warn(`Skipping ${asnDb} (IGNORE_ASN will not work):`, e.message || e);

const downloadAsn = url => {
  // Time out instead of stalling the build when outbound traffic is silently dropped.
  const req = https.get(url, { timeout: 30000 }, res => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      res.resume();
      downloadAsn(res.headers.location);
      return;
    }

    if (res.statusCode !== 200) {
      res.resume();
      skipAsn(`HTTP ${res.statusCode}`);
      return;
    }

    res
      .pipe(zlib.createGunzip())
      .on('error', skipAsn)
      .pipe(list())
      .on('entry', entry => {
        if (entry.path.endsWith('.mmdb')) {
          const filename = path.join(dest, path.basename(entry.path));
          entry.pipe(fs.createWriteStream(filename));

          console.log('Saved geo database:', filename);
        }
      });
  });

  req.on('timeout', () => req.destroy(new Error('Timed out')));
  req.on('error', skipAsn);
};

downloadAsn(asnUrl);
