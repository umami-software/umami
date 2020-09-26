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
  if (process.env.LOG_QUERY) {
    console.log(chalk.yellow(e.params), '->', e.query, chalk.greenBright(`${e.duration}ms`));
  }
}

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(options);
  prisma.$on('query', logQuery);
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(options);
    global.prisma.$on('query', logQuery);
  }

  prisma = global.prisma;
}

export default prisma;
