import { Kafka, logLevel } from 'kafkajs';
import dateFormat from 'dateformat';
import debug from 'debug';
import { KAFKA, KAFKA_PRODUCER } from 'lib/db';

const log = debug('umami:kafka');

function getClient() {
  const { username, password } = new URL(process.env.KAFKA_URL);
  const brokers = process.env.KAFKA_BROKER.split(',');
  const fs = require('fs');

  const ssl =
    username && password
      ? {
          ssl: {
            checkServerIdentity: () => undefined,
            ca: [fs.readFileSync('./lib/cert/ca_cert.pem', 'utf-8')],
            key: fs.readFileSync('./lib/cert/client_key.pem', 'utf-8'),
            cert: fs.readFileSync('./lib/cert/client_cert.pem', 'utf-8'),
          },
          sasl: {
            mechanism: 'plain',
            username,
            password,
          },
        }
      : {};

  const client = new Kafka({
    clientId: 'umami',
    brokers: brokers,
    connectionTimeout: 3000,
    logLevel: logLevel.ERROR,
    ...ssl,
  });

  if (process.env.NODE_ENV !== 'production') {
    global[KAFKA] = client;
  }

  log('Kafka initialized');

  return client;
}

async function getProducer() {
  const producer = kafka.producer();
  await producer.connect();

  if (process.env.NODE_ENV !== 'production') {
    global[KAFKA_PRODUCER] = producer;
  }

  log('Kafka producer initialized');

  return producer;
}

function getDateFormat(date) {
  return dateFormat(date, 'UTC:yyyy-mm-dd HH:MM:ss');
}

async function sendMessage(params, topic) {
  await producer.send({
    topic,
    messages: [
      {
        value: JSON.stringify(params),
      },
    ],
    acks: 1,
  });
}

// Initialization
let kafka;
let producer;

(async () => {
  kafka = process.env.KAFKA_URL && process.env.KAFKA_BROKER && (global[KAFKA] || getClient());

  if (kafka) {
    producer = global[KAFKA_PRODUCER] || (await getProducer());
  }
})();

export default {
  client: kafka,
  producer: producer,
  log,
  getDateFormat,
  sendMessage,
};
