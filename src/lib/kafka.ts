import type * as tls from 'node:tls';
import debug from 'debug';
import { Kafka, logLevel, type Producer, type RecordMetadata, type SASLOptions } from 'kafkajs';
import { serializeError } from 'serialize-error';
import { KAFKA, KAFKA_PRODUCER } from '@/lib/db';

const log = debug('umami:kafka');
const CONNECT_TIMEOUT = 5000;
const SEND_TIMEOUT = 3000;
const ACKS = 1;
const DEFAULT_MAX_MESSAGE_BYTES = 900_000;

let kafka: Kafka;
let producer: Producer;
const enabled = Boolean(process.env.KAFKA_URL && process.env.KAFKA_BROKER);

type KafkaMessage = Record<string, unknown>;
type KafkaProducerMessage = { value: string };

function getMaxMessageBytes() {
  const size = Number(process.env.KAFKA_MAX_MESSAGE_BYTES);

  return Number.isFinite(size) && size > 0 ? size : DEFAULT_MAX_MESSAGE_BYTES;
}

function getMessageSize(value: string) {
  return Buffer.byteLength(value, 'utf8');
}

function getMessages(message: KafkaMessage | KafkaMessage[]) {
  const items = Array.isArray(message) ? message : [message];

  return items.map(item => {
    const value = JSON.stringify(item);

    return { value, size: getMessageSize(value) };
  });
}

function getClient() {
  const { username, password } = new URL(process.env.KAFKA_URL);
  const brokers = process.env.KAFKA_BROKER.split(',');
  const mechanism =
    (process.env.KAFKA_SASL_MECHANISM as 'plain' | 'scram-sha-256' | 'scram-sha-512') || 'plain';

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
    globalThis[KAFKA] = client;
  }

  log('Kafka initialized');

  return client;
}

async function getProducer(): Promise<Producer> {
  const producer = kafka.producer();
  await producer.connect();

  if (process.env.NODE_ENV !== 'production') {
    globalThis[KAFKA_PRODUCER] = producer;
  }

  log('Kafka producer initialized');

  return producer;
}

async function sendMessage(
  topic: string,
  message: KafkaMessage | KafkaMessage[],
): Promise<RecordMetadata[]> {
  try {
    await connect();

    const maxMessageBytes = getMaxMessageBytes();
    const messages = getMessages(message);
    const result: RecordMetadata[] = [];
    let batch: KafkaProducerMessage[] = [];
    let batchSize = 0;

    for (const { value, size } of messages) {
      if (size > maxMessageBytes) {
        log('Kafka message dropped: topic=%s size=%d max=%d', topic, size, maxMessageBytes);
        continue;
      }

      if (batch.length && batchSize + size > maxMessageBytes) {
        result.push(
          ...(await producer.send({
            topic,
            messages: batch,
            timeout: SEND_TIMEOUT,
            acks: ACKS,
          })),
        );
        batch = [];
        batchSize = 0;
      }

      batch.push({ value });
      batchSize += size;
    }

    if (batch.length) {
      result.push(
        ...(await producer.send({
          topic,
          messages: batch,
          timeout: SEND_TIMEOUT,
          acks: ACKS,
        })),
      );
    }

    return result;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('KAFKA ERROR:', serializeError(e));

    return [];
  }
}

async function connect(): Promise<Kafka> {
  if (!kafka) {
    kafka = process.env.KAFKA_URL && process.env.KAFKA_BROKER && (globalThis[KAFKA] || getClient());

    if (kafka) {
      producer = globalThis[KAFKA_PRODUCER] || (await getProducer());
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
