import { serializeError } from 'serialize-error';
import debug from 'debug';
import { Kafka, Producer, RecordMetadata, SASLOptions, logLevel } from 'kafkajs';
import { KAFKA, KAFKA_PRODUCER } from '@/lib/db';
import * as tls from 'tls';

const log = debug('umami:kafka');
const CONNECT_TIMEOUT = 5000;
const SEND_TIMEOUT = 3000;
const ACKS = 1;

let kafka: Kafka;
let producer: Producer;
const enabled = Boolean(process.env.KAFKA_URL && process.env.KAFKA_BROKER);

function getClient() {
  const { username, password } = new URL(process.env.KAFKA_URL);
  const brokers = process.env.KAFKA_BROKER.split(',');
  const mechanism = process.env.KAFKA_SASL_MECHANISM as 'plain' | 'scram-sha-256' | 'scram-sha-512';

  const ssl: { ssl?: tls.ConnectionOptions | boolean; sasl?: SASLOptions } =
    username && password
      ? {
          ssl: {
            rejectUnauthorized: false,
          },
          sasl: {
            mechanism,
            username,
            password,
          },
        }
      : {};

  const client: Kafka = new Kafka({
    clientId: 'umami',
    brokers: brokers,
    connectionTimeout: CONNECT_TIMEOUT,
    logLevel: logLevel.ERROR,
    ...ssl,
  });

  if (process.env.NODE_ENV !== 'production') {
    global[KAFKA] = client;
  }

  log('Kafka initialized');

  return client;
}

async function getProducer(): Promise<Producer> {
  const producer = kafka.producer();
  await producer.connect();

  if (process.env.NODE_ENV !== 'production') {
    global[KAFKA_PRODUCER] = producer;
  }

  log('Kafka producer initialized');

  return producer;
}

async function sendMessage(
  topic: string,
  message: { [key: string]: string | number } | { [key: string]: string | number }[],
): Promise<RecordMetadata[]> {
  try {
    await connect();

    return producer.send({
      topic,
      messages: Array.isArray(message)
        ? message.map(a => {
            return { value: JSON.stringify(a) };
          })
        : [
            {
              value: JSON.stringify(message),
            },
          ],
      timeout: SEND_TIMEOUT,
      acks: ACKS,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('KAFKA ERROR:', serializeError(e));
  }
}

async function connect(): Promise<Kafka> {
  if (!kafka) {
    kafka = process.env.KAFKA_URL && process.env.KAFKA_BROKER && (global[KAFKA] || getClient());

    if (kafka) {
      producer = global[KAFKA_PRODUCER] || (await getProducer());
    }
  }

  return kafka;
}

export default {
  enabled,
  client: kafka,
  producer,
  log,
  connect,
  sendMessage,
};
