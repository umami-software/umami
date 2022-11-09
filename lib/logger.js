import { FluentClient } from '@fluent-org/logger';
const logger = new FluentClient(process.env.FLUENT_TAG_PREFIX, {
  socket: {
    host: process.env.FLUENTD_HOST,
    port: process.env.FLUENTD_PORT,

    timeout: 3000, // 3 seconds
  },
});

export default logger;
