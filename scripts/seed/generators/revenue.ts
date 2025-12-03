import { uuid, randomFloat } from '../utils.js';
import type { EventData } from './events.js';

export interface RevenueConfig {
  eventName: string;
  minAmount: number;
  maxAmount: number;
  currency: string;
  weight: number;
}

export interface RevenueData {
  id: string;
  websiteId: string;
  sessionId: string;
  eventId: string;
  eventName: string;
  currency: string;
  revenue: number;
  createdAt: Date;
}

export function generateRevenue(event: EventData, config: RevenueConfig): RevenueData | null {
  if (event.eventName !== config.eventName) {
    return null;
  }

  if (Math.random() > config.weight) {
    return null;
  }

  const revenue = randomFloat(config.minAmount, config.maxAmount);

  return {
    id: uuid(),
    websiteId: event.websiteId,
    sessionId: event.sessionId,
    eventId: event.id,
    eventName: event.eventName!,
    currency: config.currency,
    revenue: Math.round(revenue * 100) / 100, // Round to 2 decimal places
    createdAt: event.createdAt,
  };
}

export function generateRevenueForEvents(
  events: EventData[],
  configs: RevenueConfig[],
): RevenueData[] {
  const revenueEntries: RevenueData[] = [];

  for (const event of events) {
    if (!event.eventName) continue;

    for (const config of configs) {
      const revenue = generateRevenue(event, config);
      if (revenue) {
        revenueEntries.push(revenue);
        break; // Only one revenue per event
      }
    }
  }

  return revenueEntries;
}
