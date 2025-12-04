/* eslint-disable no-console */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../../src/generated/prisma/client.js';
import { uuid, generateDatesBetween, subDays, formatNumber, progressBar } from './utils.js';
import { createSessions, type SessionData } from './generators/sessions.js';
import {
  generateEventsForSession,
  type EventData,
  type EventDataEntry,
} from './generators/events.js';
import {
  generateRevenueForEvents,
  type RevenueData,
  type RevenueConfig,
} from './generators/revenue.js';
import { getSessionCountForDay } from './distributions/temporal.js';
import {
  BLOG_WEBSITE_NAME,
  BLOG_WEBSITE_DOMAIN,
  BLOG_SESSIONS_PER_DAY,
  getBlogSiteConfig,
  getBlogJourney,
} from './sites/blog.js';
import {
  SAAS_WEBSITE_NAME,
  SAAS_WEBSITE_DOMAIN,
  SAAS_SESSIONS_PER_DAY,
  getSaasSiteConfig,
  getSaasJourney,
  saasRevenueConfigs,
} from './sites/saas.js';

const BATCH_SIZE = 1000;

type SessionCreateInput = Prisma.SessionCreateManyInput;
type WebsiteEventCreateInput = Prisma.WebsiteEventCreateManyInput;
type EventDataCreateInput = Prisma.EventDataCreateManyInput;
type RevenueCreateInput = Prisma.RevenueCreateManyInput;

export interface SeedConfig {
  days: number;
  clear: boolean;
  verbose: boolean;
}

export interface SeedResult {
  websites: number;
  sessions: number;
  events: number;
  eventData: number;
  revenue: number;
}

async function batchInsertSessions(
  prisma: PrismaClient,
  data: SessionCreateInput[],
  verbose: boolean,
): Promise<void> {
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    await prisma.session.createMany({ data: batch, skipDuplicates: true });
    if (verbose) {
      console.log(
        `  Inserted ${Math.min(i + BATCH_SIZE, data.length)}/${data.length} session records`,
      );
    }
  }
}

async function batchInsertEvents(
  prisma: PrismaClient,
  data: WebsiteEventCreateInput[],
  verbose: boolean,
): Promise<void> {
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    await prisma.websiteEvent.createMany({ data: batch, skipDuplicates: true });
    if (verbose) {
      console.log(
        `  Inserted ${Math.min(i + BATCH_SIZE, data.length)}/${data.length} event records`,
      );
    }
  }
}

async function batchInsertEventData(
  prisma: PrismaClient,
  data: EventDataCreateInput[],
  verbose: boolean,
): Promise<void> {
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    await prisma.eventData.createMany({ data: batch, skipDuplicates: true });
    if (verbose) {
      console.log(
        `  Inserted ${Math.min(i + BATCH_SIZE, data.length)}/${data.length} eventData records`,
      );
    }
  }
}

async function batchInsertRevenue(
  prisma: PrismaClient,
  data: RevenueCreateInput[],
  verbose: boolean,
): Promise<void> {
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    await prisma.revenue.createMany({ data: batch, skipDuplicates: true });
    if (verbose) {
      console.log(
        `  Inserted ${Math.min(i + BATCH_SIZE, data.length)}/${data.length} revenue records`,
      );
    }
  }
}

async function findAdminUser(prisma: PrismaClient): Promise<string> {
  const adminUser = await prisma.user.findFirst({
    where: { role: 'admin' },
    select: { id: true },
  });

  if (!adminUser) {
    throw new Error(
      'No admin user found in the database.\n' +
        'Please ensure you have run the initial setup and created an admin user.\n' +
        'The default admin user is created during first build (username: admin, password: umami).',
    );
  }

  return adminUser.id;
}

async function createWebsite(
  prisma: PrismaClient,
  name: string,
  domain: string,
  adminUserId: string,
): Promise<string> {
  const websiteId = uuid();

  await prisma.website.create({
    data: {
      id: websiteId,
      name,
      domain,
      userId: adminUserId,
      createdBy: adminUserId,
    },
  });

  return websiteId;
}

async function clearDemoData(prisma: PrismaClient): Promise<void> {
  console.log('Clearing existing demo data...');

  const demoWebsites = await prisma.website.findMany({
    where: {
      OR: [{ name: BLOG_WEBSITE_NAME }, { name: SAAS_WEBSITE_NAME }],
    },
    select: { id: true },
  });

  const websiteIds = demoWebsites.map(w => w.id);

  if (websiteIds.length === 0) {
    console.log('  No existing demo websites found');
    return;
  }

  console.log(`  Found ${websiteIds.length} demo website(s)`);

  // Delete in correct order due to foreign key constraints
  await prisma.revenue.deleteMany({ where: { websiteId: { in: websiteIds } } });
  await prisma.eventData.deleteMany({ where: { websiteId: { in: websiteIds } } });
  await prisma.sessionData.deleteMany({ where: { websiteId: { in: websiteIds } } });
  await prisma.websiteEvent.deleteMany({ where: { websiteId: { in: websiteIds } } });
  await prisma.session.deleteMany({ where: { websiteId: { in: websiteIds } } });
  await prisma.segment.deleteMany({ where: { websiteId: { in: websiteIds } } });
  await prisma.report.deleteMany({ where: { websiteId: { in: websiteIds } } });
  await prisma.website.deleteMany({ where: { id: { in: websiteIds } } });

  console.log('  Cleared existing demo data');
}

interface SiteGeneratorConfig {
  name: string;
  domain: string;
  sessionsPerDay: number;
  getSiteConfig: () => ReturnType<typeof getBlogSiteConfig>;
  getJourney: () => string[];
  revenueConfigs?: RevenueConfig[];
}

async function generateSiteData(
  prisma: PrismaClient,
  config: SiteGeneratorConfig,
  days: Date[],
  adminUserId: string,
  verbose: boolean,
): Promise<{ sessions: number; events: number; eventData: number; revenue: number }> {
  console.log(`\nGenerating data for ${config.name}...`);

  const websiteId = await createWebsite(prisma, config.name, config.domain, adminUserId);
  console.log(`  Created website: ${config.name} (${websiteId})`);

  const siteConfig = config.getSiteConfig();

  const allSessions: SessionData[] = [];
  const allEvents: EventData[] = [];
  const allEventData: EventDataEntry[] = [];
  const allRevenue: RevenueData[] = [];

  for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
    const day = days[dayIndex];
    const sessionCount = getSessionCountForDay(config.sessionsPerDay, day);
    const sessions = createSessions(websiteId, day, sessionCount);

    for (const session of sessions) {
      const journey = config.getJourney();
      const { events, eventDataEntries } = generateEventsForSession(session, siteConfig, journey);

      allSessions.push(session);
      allEvents.push(...events);
      allEventData.push(...eventDataEntries);

      if (config.revenueConfigs) {
        const revenueEntries = generateRevenueForEvents(events, config.revenueConfigs);
        allRevenue.push(...revenueEntries);
      }
    }

    // Show progress (every day in verbose mode, otherwise every 2 days)
    const shouldShowProgress = verbose || dayIndex % 2 === 0 || dayIndex === days.length - 1;
    if (shouldShowProgress) {
      process.stdout.write(
        `\r  ${progressBar(dayIndex + 1, days.length)} Day ${dayIndex + 1}/${days.length}`,
      );
    }
  }

  console.log(''); // New line after progress bar

  // Batch insert all data
  console.log(`  Inserting ${formatNumber(allSessions.length)} sessions...`);
  await batchInsertSessions(prisma, allSessions as SessionCreateInput[], verbose);

  console.log(`  Inserting ${formatNumber(allEvents.length)} events...`);
  await batchInsertEvents(prisma, allEvents as WebsiteEventCreateInput[], verbose);

  if (allEventData.length > 0) {
    console.log(`  Inserting ${formatNumber(allEventData.length)} event data entries...`);
    await batchInsertEventData(prisma, allEventData as EventDataCreateInput[], verbose);
  }

  if (allRevenue.length > 0) {
    console.log(`  Inserting ${formatNumber(allRevenue.length)} revenue entries...`);
    await batchInsertRevenue(prisma, allRevenue as RevenueCreateInput[], verbose);
  }

  return {
    sessions: allSessions.length,
    events: allEvents.length,
    eventData: allEventData.length,
    revenue: allRevenue.length,
  };
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set.\n' +
        'Please set DATABASE_URL in your .env file or environment.\n' +
        'Example: DATABASE_URL=postgresql://user:password@localhost:5432/umami',
    );
  }

  let schema: string | undefined;
  try {
    const connectionUrl = new URL(url);
    schema = connectionUrl.searchParams.get('schema') ?? undefined;
  } catch {
    throw new Error(
      'DATABASE_URL is not a valid URL.\n' +
        'Expected format: postgresql://user:password@host:port/database\n' +
        `Received: ${url.substring(0, 30)}...`,
    );
  }

  const adapter = new PrismaPg({ connectionString: url }, { schema });

  return new PrismaClient({
    adapter,
    errorFormat: 'pretty',
  });
}

export async function seed(config: SeedConfig): Promise<SeedResult> {
  const prisma = createPrismaClient();

  try {
    const endDate = new Date();
    const startDate = subDays(endDate, config.days);
    const days = generateDatesBetween(startDate, endDate);

    console.log(`\nSeed Configuration:`);
    console.log(
      `  Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
    );
    console.log(`  Days: ${days.length}`);
    console.log(`  Clear existing: ${config.clear}`);

    if (config.clear) {
      await clearDemoData(prisma);
    }

    // Find admin user to own the demo websites
    const adminUserId = await findAdminUser(prisma);
    console.log(`  Using admin user: ${adminUserId}`);

    // Generate Blog site (low traffic)
    const blogResults = await generateSiteData(
      prisma,
      {
        name: BLOG_WEBSITE_NAME,
        domain: BLOG_WEBSITE_DOMAIN,
        sessionsPerDay: BLOG_SESSIONS_PER_DAY,
        getSiteConfig: getBlogSiteConfig,
        getJourney: getBlogJourney,
      },
      days,
      adminUserId,
      config.verbose,
    );

    // Generate SaaS site (high traffic)
    const saasResults = await generateSiteData(
      prisma,
      {
        name: SAAS_WEBSITE_NAME,
        domain: SAAS_WEBSITE_DOMAIN,
        sessionsPerDay: SAAS_SESSIONS_PER_DAY,
        getSiteConfig: getSaasSiteConfig,
        getJourney: getSaasJourney,
        revenueConfigs: saasRevenueConfigs,
      },
      days,
      adminUserId,
      config.verbose,
    );

    const result: SeedResult = {
      websites: 2,
      sessions: blogResults.sessions + saasResults.sessions,
      events: blogResults.events + saasResults.events,
      eventData: blogResults.eventData + saasResults.eventData,
      revenue: blogResults.revenue + saasResults.revenue,
    };

    console.log(`\n${'─'.repeat(50)}`);
    console.log(`Seed Complete!`);
    console.log(`${'─'.repeat(50)}`);
    console.log(`  Websites:   ${formatNumber(result.websites)}`);
    console.log(`  Sessions:   ${formatNumber(result.sessions)}`);
    console.log(`  Events:     ${formatNumber(result.events)}`);
    console.log(`  Event Data: ${formatNumber(result.eventData)}`);
    console.log(`  Revenue:    ${formatNumber(result.revenue)}`);
    console.log(`${'─'.repeat(50)}\n`);

    return result;
  } finally {
    await prisma.$disconnect();
  }
}
