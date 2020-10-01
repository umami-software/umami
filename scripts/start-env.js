require('dotenv').config();
const cli = require('next/dist/cli/next-start');

cli.nextStart(['-p', process.env.PORT || 3000, '-H', process.env.HOSTNAME || '0.0.0.0']);
