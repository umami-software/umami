const loadtest = require('loadtest');
const chalk = require('chalk');
const trunc = num => +num.toFixed(1);

/**
 * Example invocations:
 *
 * npm run loadtest -- --weight=heavy
 * npm run loadtest -- --weight=heavy --verbose
 * npm run loadtest -- --weight=single --verbose
 * npm run loadtest -- --weight=medium
 */

/**
 * Command line arguments like --weight=heavy and --verbose use this object
 * If you are providing _alternative_ configs, use --weight
 * e.g. add --weight=ultra then add commandlineOptions.ultra={}
 * --verbose can be combied with any weight.
 */
const commandlineOptions = {
  single: {
    concurrency: 1,
    requestsPerSecond: 1,
    maxSeconds: 5,
    maxRequests: 1,
  },
  // Heavy can saturate CPU which leads to requests stalling depending on machine
  // Keep an eye  if --verbose logs pause, or if node CPU in top is > 100.
  // https://github.com/alexfernandez/loadtest#usage-donts
  heavy: {
    concurrency: 10,
    requestsPerSecond: 200,
    maxSeconds: 60,
  },
  // Throttled requests should not max out CPU,
  medium: {
    concurrency: 3,
    requestsPerSecond: 5,
    maxSeconds: 60,
  },
  verbose: { statusCallback },
};

const options = {
  url: 'http://localhost:3000',
  method: 'POST',
  concurrency: 5,
  requestsPerSecond: 5,
  maxSeconds: 5,
  requestGenerator: (params, options, client, callback) => {
    const message = JSON.stringify(mockPageView());
    options.headers['Content-Length'] = message.length;
    options.headers['Content-Type'] = 'application/json';
    options.headers['user-agent'] = 'User-Agent: Mozilla/5.0 LoadTest';
    options.body = message;
    options.path = '/api/collect';
    const request = client(options, callback);
    request.write(message);
    return request;
  },
};

function getArgument() {
  const weight = process.argv[2] && process.argv[2].replace('--weight=', '');
  const verbose = process.argv.includes('--verbose') && 'verbose';
  return [weight, verbose];
}

// Patch in all command line arguments over options object
// Must do this prior to calling `loadTest()`
getArgument().map(arg => Object.assign(options, commandlineOptions[arg]));

loadtest.loadTest(options, (error, results) => {
  if (error) {
    return console.error(chalk.redBright('Got an error: %s', error));
  }
  console.log(chalk.bold(chalk.yellow('\n--------\n')));
  console.log(chalk.yellowBright('Loadtests complete:'), chalk.greenBright('success'), '\n');
  prettyLogItem('Total Requests:', results.totalRequests);
  prettyLogItem('Total Errors:', results.totalErrors);

  prettyLogItem(
    'Latency(mean/min/max)',
    trunc(results.meanLatencyMs),
    '/',
    trunc(results.maxLatencyMs),
    '/',
    trunc(results.minLatencyMs),
  );

  if (results.totalErrors) {
    console.log(chalk.redBright('*'), chalk.red('Total Errors:'), results.totalErrors);
  }

  if (results.errorCodes && Object.keys(results.errorCodes).length) {
    console.log(chalk.redBright('*'), chalk.red('Error Codes:'), results.errorCodes);
  }
  // console.log(results);
});

/**
 * Create a new  object for each request.  Note, we could randomize values here if desired.
 *
 * TODO: Need a better way of passing in  websiteId, hostname, URL.
 *
 * @param {object} payload pageview payload same as sent  via tracker
 */
function mockPageView(
  payload = {
    website: 'fcd4c7e3-ed76-439c-9121-3a0f102df126',
    hostname: 'localhost',
    screen: '1680x1050',
    url: '/LOADTESTING',
  },
) {
  return {
    type: 'pageview',
    payload,
  };
}

// If you pass in --verbose, this function is called
function statusCallback(error, result, latency) {
  console.log(
    chalk.yellowBright(`\n## req #${result.requestIndex + 1} of ${latency.totalRequests}`),
  );
  prettyLogItem('Request elapsed milliseconds:', trunc(result.requestElapsed));
  prettyLogItem(
    'Latency(mean/max/min):',
    trunc(latency.meanLatencyMs),
    '/',
    trunc(latency.maxLatencyMs),
    '/',
    trunc(latency.minLatencyMs),
  );
}

function prettyLogItem(label, ...args) {
  console.log(chalk.redBright('*'), chalk.green(label), ...args);
}
