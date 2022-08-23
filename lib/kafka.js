import { Kafka } from 'kafkajs';
import dateFormat from 'dateformat';

export function getKafkaClient() {
  if (!process.env.KAFKA_URL) {
    return null;
  }

  const url = new URL(process.env.KAFKA_URL);
  const brokers = process.env.KAFKA_BROKER.split(',');

  if (url.username.length === 0 && url.password.length === 0) {
    return new Kafka({
      clientId: 'umami',
      brokers: brokers,
      connectionTimeout: 3000,
    });
  } else {
    return new Kafka({
      clientId: 'umami',
      brokers: brokers,
      connectionTimeout: 3000,
      ssl: true,
      sasl: {
        mechanism: 'plain',
        username: url.username,
        password: url.password,
      },
    });
  }
}

const kafka = global.kafka || getKafkaClient();

if (process.env.NODE_ENV !== 'production') {
  global.kafka = kafka;
}

export { kafka };

export async function kafkaProducer(params, topic) {
  const producer = kafka.producer();
  await producer.connect();

  await producer.send({
    topic,
    messages: [
      {
        key: 'key',
        value: JSON.stringify(params),
      },
    ],
  });
}

export function getDateFormatKafka(date) {
  return dateFormat(date, 'UTC:yyyy-mm-dd HH:MM:ss');
}

export function getKafkaService() {
  const type = process.env.KAFKA_URL && process.env.KAFKA_URL.split(':')[0];

  return type;
}
