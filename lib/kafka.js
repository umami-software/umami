import { Kafka, logLevel } from 'kafkajs';
import dateFormat from 'dateformat';

export function getClient() {
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
      logLevel: logLevel.ERROR,
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
const kafka = global.kafka || getClient();
let kafkaProducer = null;

(async () => {
  kafkaProducer = global.kakfaProducer || (await getProducer());

  if (process.env.NODE_ENV !== 'production') {
    global.kafka = kafka;
    global.kakfaProducer = kafkaProducer;
  }
})();

export { kafka, kafkaProducer };

export async function getProducer() {
  const producer = kafka.producer();
  await producer.connect();

  return producer;
}

export function getDateFormat(date) {
  return dateFormat(date, 'UTC:yyyy-mm-dd HH:MM:ss');
}

export async function sendMessage(params, topic) {
  await kafkaProducer.send({
    topic,
    messages: [
      {
        key: 'key',
        value: JSON.stringify(params),
      },
    ],
    acks: 0,
  });
}
