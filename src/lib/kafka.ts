import type * as tls from 'node:tls';
import { CompressionTypes, Kafka, logLevel, type Producer, type SASLOptions } from 'kafkajs';
import { serializeError } from 'serialize-error';
import { BatchBuffer } from '@/lib/batch-buffer';
import { KAFKA, KAFKA_PRODUCER } from '@/lib/db';
import { createLogger } from '@/lib/logger';
import { sleep } from '@/lib/utils';

const logger = createLogger('kafka');

// Configuration from environment variables
const BATCH_WINDOW_MS = parseInt(process.env.KAFKA_BATCH_WINDOW_MS || '10', 10);
const MAX_QUEUE_SIZE = parseInt(process.env.KAFKA_MAX_QUEUE_SIZE || '500', 10);
const BATCH_SIZE = Math.floor(MAX_QUEUE_SIZE * 0.8); // Flush at 80% capacity
const CONNECT_TIMEOUT = parseInt(process.env.KAFKA_CONNECT_TIMEOUT || '10000', 10);
const SEND_TIMEOUT = parseInt(process.env.KAFKA_SEND_TIMEOUT || '30000', 10);
const ACKS = 1;
// Broker's message.max.bytes is 1048588; keep a margin for batch/protocol overhead.
const MAX_BATCH_BYTES = parseInt(process.env.KAFKA_MAX_BATCH_BYTES || '943729', 10);

let kafka: Kafka;
let producer: Producer;
const enabled = Boolean(process.env.KAFKA_URL && process.env.KAFKA_BROKER);

// Message type for batching
interface KafkaMessage {
  topic: string;
  value: string;
  timestamp: string;
}

// Batch buffer instance
let batchBuffer: BatchBuffer<KafkaMessage> | null = null;

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

  logger('Kafka initialized');

  return client;
}

async function getProducer(): Promise<Producer> {
  const producer = kafka.producer();
  await producer.connect();

  if (process.env.NODE_ENV !== 'production') {
    globalThis[KAFKA_PRODUCER] = producer;
  }

  logger(
    `Kafka producer initialized (batch: ${BATCH_SIZE}, window: ${BATCH_WINDOW_MS}ms, max: ${MAX_QUEUE_SIZE})`,
  );

  return producer;
}

/**
 * Split messages into chunks that stay under MAX_BATCH_BYTES
 */
function chunkByByteSize(
  msgs: Array<{ value: string; timestamp: string }>,
): Array<Array<{ value: string; timestamp: string }>> {
  const chunks: Array<Array<{ value: string; timestamp: string }>> = [];
  let current: Array<{ value: string; timestamp: string }> = [];
  let currentBytes = 0;

  for (const msg of msgs) {
    const msgBytes = Buffer.byteLength(msg.value, 'utf8');

    if (current.length > 0 && currentBytes + msgBytes > MAX_BATCH_BYTES) {
      chunks.push(current);
      current = [];
      currentBytes = 0;
    }

    current.push(msg);
    currentBytes += msgBytes;
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
}

const NON_RETRIABLE_SIZE_ERRORS = new Set(['MESSAGE_TOO_LARGE', 'RECORD_LIST_TOO_LARGE']);

function isMessageTooLargeError(error: unknown): boolean {
  const type = (error as { type?: string; cause?: { type?: string } })?.type;
  const causeType = (error as { cause?: { type?: string } })?.cause?.type;

  return NON_RETRIABLE_SIZE_ERRORS.has(type) || NON_RETRIABLE_SIZE_ERRORS.has(causeType);
}

/**
 * Send a chunk, bisecting and dropping only the oversized message(s) if the
 * broker permanently rejects it for size — prevents a poison message from
 * blocking the batch buffer forever (everything else keeps flowing).
 */
async function sendChunkSafely(
  topic: string,
  chunk: Array<{ value: string; timestamp: string }>,
): Promise<void> {
  try {
    await producer.send({
      topic,
      messages: chunk,
      acks: ACKS,
      timeout: SEND_TIMEOUT,
      compression: CompressionTypes.GZIP,
    });
  } catch (error) {
    if (!isMessageTooLargeError(error)) {
      throw error;
    }

    if (chunk.length === 1) {
      logger.error(
        `Dropping oversized message on topic "${topic}" (${Buffer.byteLength(chunk[0].value, 'utf8')} bytes, exceeds broker limit)`,
      );
      return;
    }

    const mid = Math.floor(chunk.length / 2);
    await sendChunkSafely(topic, chunk.slice(0, mid));
    await sendChunkSafely(topic, chunk.slice(mid));
  }
}

/**
 * Flush handler called by BatchBuffer when it's time to send messages
 */
async function flushBatch(messages: KafkaMessage[]): Promise<void> {
  if (messages.length === 0) {
    return;
  }

  // Group messages by topic
  const topicGroups = messages.reduce(
    (acc, msg) => {
      if (!acc[msg.topic]) acc[msg.topic] = [];
      acc[msg.topic].push({
        value: msg.value,
        timestamp: msg.timestamp,
      });
      return acc;
    },
    {} as Record<string, Array<{ value: string; timestamp: string }>>,
  );

  await connect();

  if (!producer) {
    await sleep(500);
  }

  // Send all topics in parallel, chunked to stay under the broker's max message size
  await Promise.all(
    Object.entries(topicGroups).flatMap(([topic, msgs]) =>
      chunkByByteSize(msgs).map(chunk => sendChunkSafely(topic, chunk)),
    ),
  );

  logger(`Flushed ${messages.length} messages across ${Object.keys(topicGroups).length} topics`);
}

/**
 * Initialize batch buffer
 */
function initializeBatchBuffer(): void {
  if (!batchBuffer) {
    batchBuffer = new BatchBuffer<KafkaMessage>({
      batchSize: BATCH_SIZE,
      batchWindowMs: BATCH_WINDOW_MS,
      maxBufferSize: MAX_QUEUE_SIZE,
      onFlush: flushBatch,
      name: 'kafka',
    });

    batchBuffer.start();
    logger('Batch buffer initialized and started');
  }
}

/**
 * Send message to Kafka with automatic batching
 */
async function sendMessage(
  topic: string,
  message: Record<string, unknown> | Record<string, unknown>[],
): Promise<void> {
  if (!batchBuffer) {
    initializeBatchBuffer();
  }

  const messages = Array.isArray(message) ? message : [message];

  // Add each message to the batch buffer (synchronous, non-blocking)
  for (const msg of messages) {
    batchBuffer.add({
      topic,
      value: JSON.stringify(msg),
      timestamp: Date.now().toString(),
    });
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

/**
 * Graceful shutdown: flush remaining messages and disconnect
 */
export async function gracefulShutdown(): Promise<void> {
  logger('Initiating graceful shutdown...');

  try {
    // Shutdown batch buffer (this will flush remaining messages)
    if (batchBuffer) {
      await batchBuffer.shutdown();
    }

    // Disconnect producer
    if (producer) {
      await producer.disconnect();
      logger('Producer disconnected');
    }
  } catch (e) {
    logger.error('Error during graceful shutdown:', serializeError(e));
  }

  logger('Kafka shutdown complete');
}

/**
 * Get current buffer metrics
 */
export function getMetrics() {
  return {
    bufferSize: batchBuffer?.getBufferSize() || 0,
    maxBufferSize: MAX_QUEUE_SIZE,
    batchSize: BATCH_SIZE,
    batchWindowMs: BATCH_WINDOW_MS,
  };
}

export default {
  enabled,
  client: kafka,
  producer,
  log: logger,
  connect,
  sendMessage,
  gracefulShutdown,
  getMetrics,
};
