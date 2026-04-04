import type { Report } from '@/generated/prisma/client';
import type { Auth } from '@/lib/types';
import { canDeleteWebsite, canUpdateWebsite, canViewWebsite } from './website';

export async function canViewReport(auth: Auth, report: Report) {
  if (auth.user?.isAdmin) {
    return true;
  }

  if (auth.user?.id === report.userId) {
    return true;
  }

  return !!(await canViewWebsite(auth, report.websiteId));
}

export async function canUpdateReport(auth: Auth, report: Report) {
  if (!auth.user) {
    return false;
  }

  if (auth.user.isAdmin) {
    return true;
  }

  if (auth.user.id === report.userId) {
    return true;
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
    return true;
  }

  return !!(await canDeleteWebsite(auth, report.websiteId));
}
