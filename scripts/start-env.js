const cli = require('next/dist/cli/next-start');

cli.nextStart(['-p', process.env.PORT || 50001, '-H', process.env.HOSTNAME || '0.0.0.0']);
