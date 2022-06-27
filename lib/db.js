import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';

const options = {
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
};

function logQuery(e) {
  console.log(chalk.yellow(e.params), '->', e.query, chalk.greenBright(`${e.duration}ms`));
}

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(options);
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(options);
  }

  prisma = global.prisma;
}

if (process.env.LOG_QUERY) {
  prisma.$on('query', logQuery);
}

export default prisma;
