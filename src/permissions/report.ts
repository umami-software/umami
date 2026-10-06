import type { Report } from '@/generated/prisma/client';
import { getBillingAccess, getWebsiteBillingScope } from '@/lib/load';
import type { Auth } from '@/lib/types';
import { getWebsite } from '@/queries/prisma';
import type { ShareSection } from './share';
import { canViewWebsiteSection } from './share';
import { canDeleteWebsite, canUpdateWebsite, canViewWebsite } from './website';

async function hasReportBillingAccess(report: Report) {
  if (!process.env.CLOUD_MODE) {
    return true;
  }

  const website = await getWebsite(report.websiteId);

  return !!website && !(await getBillingAccess(await getWebsiteBillingScope(website))).isPastDue;
}

export function getReportSection(type?: string): ShareSection | null {
  switch (type) {
    case 'attribution':
    case 'breakdown':
    case 'performance':
    case 'retention':
    case 'revenue':
    case 'commerce':
    case 'utm':
      return type;
    case 'funnel':
      return 'funnels';
    case 'goal':
      return 'goals';
    case 'journey':
      return 'journeys';
    default:
      return null;
  }
}

export async function canViewReport(auth: Auth, report: Report | null) {
  if (!report) {
    return false;
  }

  if (auth.user?.isAdmin) {
    return true;
  }

  const section = getReportSection(report.type);

  if (auth.user?.id === report.userId) {
    return hasReportBillingAccess(report);
  }

  if (section) {
    return !!(await canViewWebsiteSection(auth, report.websiteId, section));
  }

  return !!auth.user && !!(await canViewWebsite(auth, report.websiteId));
}

export async function canUpdateReport(auth: Auth, report: Report) {
  if (!auth.user) {
    return false;
  }

  if (auth.user.isAdmin) {
    return true;
  }

  if (auth.user.id === report.userId) {
    return hasReportBillingAccess(report);
  }

  return !!(await canUpdateWebsite(auth, report.websiteId));
}

export async function canDeleteReport(auth: Auth, report: Report) {
  if (!auth.user) {
    return false;
  }

  if (auth.user.isAdmin) {
    return true;
  }

  if (auth.user.id === report.userId) {
    return hasReportBillingAccess(report);
  }

  return !!(await canDeleteWebsite(auth, report.websiteId));
}
