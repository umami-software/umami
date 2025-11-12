/* eslint-disable no-console */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import https from 'https';
import zlib from 'zlib';
import tar from 'tar';

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
      resolve(res.pipe(zlib.createGunzip({})).pipe(tar.t()));
    });
  });

// Download handler for direct .mmdb files
const downloadDirect = (url, originalUrl) =>
  new Promise((resolve, reject) => {
    https.get(url, res => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadDirect(res.headers.location, originalUrl || url).then(resolve).catch(reject);
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
  downloadCompressed(url).then(
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
  ).catch(e => {
    console.error('Failed to download geo database:', e);
    process.exit(1);
  });
}
