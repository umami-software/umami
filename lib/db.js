import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';

BigInt.prototype.toJSON = function () {
  return Number(this);
};

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

function getClient(options) {
  const prisma = new PrismaClient(options);

  if (process.env.LOG_QUERY) {
    prisma.$on('query', logQuery);
  }

  return prisma;
}

const prisma = global.prisma || getClient(options);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
