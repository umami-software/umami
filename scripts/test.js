/* eslint-disable no-console */
require('dotenv').config();
const path = require('path');

const maxmind = require('maxmind');

async function getLocation() {
  const lookup = await maxmind.open(path.resolve('../node_modules/.geo/GeoLite2-City.mmdb'));
  const result = lookup.get('46.135.3.1');

  const country = result?.country?.iso_code ?? result?.registered_country?.iso_code;
  const subdivision = result?.subdivisions[0]?.iso_code;
  const subdivision2 = result?.subdivisions[0]?.names?.en;
  const subdivision3 = result?.subdivisions[1]?.names?.en;
  const city = result?.city?.names?.en;
  console.log(result);
  console.log(country, subdivision, city, subdivision2, subdivision3);
}

getLocation();
