const produce_session = require('./sessionProducer');
const produce_pageview = require('./pageviewProducer');
const produce_event = require('./eventProducer');

// call the `produce` function and log an error if it occurs
produce_pageview().catch(err => {
  console.error('error in producer_pageview: ', err);
});

produce_session().catch(err => {
  console.error('error in producer_session: ', err);
});

produce_event().catch(err => {
  console.error('error in producer_event: ', err);
});

// const { Kafka } = require('kafkajs')

// const KAFKA_URL="kafka://localhost:9092/";
// const KAFKA_BROKER="localhost:9092,localhost:9093,localhost:9094"

// const url = new URL(KAFKA_URL);
// const database = url.pathname.replace('/', '');
// var brokers = KAFKA_BROKER.split(',');

// console.log(url);
// console.log(database);
// console.log(brokers);
