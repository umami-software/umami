// import the `Kafka` instance from the kafkajs library
const { Kafka } = require('kafkajs');

// the client ID lets kafka know who's producing the messages
const clientId = 'my-app';
// we can define the list of brokers in the cluster
const brokers = ['localhost:9092', 'localhost:9093', 'localhost:9094'];
// this is the topic to which we want to write messages
const topic = 'pageview';

// initialize a new kafka client and initialize a producer from it
const kafka = new Kafka({ clientId, brokers });
const { Partitioners } = require('kafkajs');

const producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });

// we define an async function that writes a new message each second
async function produce_pageview() {
  await producer.connect();
  let i = 0;

  // after the produce has connected, we start an interval timer
  setInterval(async () => {
    try {
      // send a message to the configured topic with
      // the key and value formed from the current value of `i`
      let y = Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, 5);
      let z = Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, 5);
      let x = {
        website_id: i,
        session_uuid: '00fea66e-a433-536d-a13d-2d873fab0a08',
        created_at: '2020-07-18 11:53:33',
        url: y,
        referrer: z,
      };

      await producer.send({
        topic,
        messages: [
          {
            key: 'my-key',
            value: JSON.stringify(x),
          },
          {
            key: 'my-key',
            value: JSON.stringify(x),
          },
          {
            key: 'my-key',
            value: JSON.stringify(x),
          },
          {
            key: 'my-key',
            value: JSON.stringify(x),
          },
          {
            key: 'my-key',
            value: JSON.stringify(x),
          },
        ],
      });
      i++;
    } catch (err) {
      console.error('could not write message ' + err);
    }
  }, 4);
}

module.exports = produce_pageview;
