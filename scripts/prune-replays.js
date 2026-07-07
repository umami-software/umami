/* eslint-disable no-console */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import chalk from 'chalk';
import { PrismaClient } from '../generated/prisma/client.js';

const DEFAULT_RETENTION_DAYS = 7;

if (process.env.SKIP_REPLAY_PRUNE) {
  console.log('Skipping replay prune.');
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error(chalk.redBright('DATABASE_URL is not defined.'));
  process.exit(1);
}

if (process.env.CLICKHOUSE_URL) {
  console.warn(
    chalk.yellow(
      'CLICKHOUSE_URL is set. This script only prunes PostgreSQL session_replay rows.',
    ),
  );
}

const retentionDays = Number.parseInt(
  process.env.REPLAY_RETENTION_DAYS ?? String(DEFAULT_RETENTION_DAYS),
  10,
);

if (!Number.isFinite(retentionDays) || retentionDays < 1) {
  console.error(chalk.redBright('REPLAY_RETENTION_DAYS must be a positive integer.'));
  process.exit(1);
}

const includeSaved = process.env.REPLAY_PRUNE_INCLUDE_SAVED === 'true';

const url = new URL(process.env.DATABASE_URL);

const adapter = new PrismaPg(
  { connectionString: url.toString() },
  { schema: url.searchParams.get('schema') },
);

const prisma = new PrismaClient({ adapter });

(async () => {
  try {
    await prisma.$connect();

    const deleted = includeSaved
      ? await prisma.$executeRaw`
          DELETE FROM session_replay
          WHERE created_at < NOW() - make_interval(days => ${retentionDays})
        `
      : await prisma.$executeRaw`
          DELETE FROM session_replay sr
          WHERE sr.created_at < NOW() - make_interval(days => ${retentionDays})
            AND NOT EXISTS (
              SELECT 1
              FROM session_replay_saved s
              WHERE s.website_id = sr.website_id
                AND s.visit_id = sr.visit_id
            )
        `;

    console.log(
      chalk.greenBright(
        `✓ Pruned ${deleted} session replay chunk(s) older than ${retentionDays} day(s)${
          includeSaved ? '' : ' (saved replays kept)'
        }.`,
      ),
    );
  } catch (e) {
    console.error(chalk.redBright(`✗ Replay prune failed: ${e.message}`));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
