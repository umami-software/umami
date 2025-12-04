import { weightedRandom, randomInt, type WeightedOption } from '../utils.js';

const hourlyWeights: WeightedOption<number>[] = [
  { value: 0, weight: 0.02 },
  { value: 1, weight: 0.01 },
  { value: 2, weight: 0.01 },
  { value: 3, weight: 0.01 },
  { value: 4, weight: 0.01 },
  { value: 5, weight: 0.02 },
  { value: 6, weight: 0.03 },
  { value: 7, weight: 0.05 },
  { value: 8, weight: 0.07 },
  { value: 9, weight: 0.08 },
  { value: 10, weight: 0.09 },
  { value: 11, weight: 0.08 },
  { value: 12, weight: 0.07 },
  { value: 13, weight: 0.08 },
  { value: 14, weight: 0.09 },
  { value: 15, weight: 0.08 },
  { value: 16, weight: 0.07 },
  { value: 17, weight: 0.06 },
  { value: 18, weight: 0.05 },
  { value: 19, weight: 0.04 },
  { value: 20, weight: 0.03 },
  { value: 21, weight: 0.03 },
  { value: 22, weight: 0.02 },
  { value: 23, weight: 0.02 },
];

const dayOfWeekWeights: WeightedOption<number>[] = [
  { value: 0, weight: 0.08 }, // Sunday
  { value: 1, weight: 0.16 }, // Monday
  { value: 2, weight: 0.17 }, // Tuesday
  { value: 3, weight: 0.17 }, // Wednesday
  { value: 4, weight: 0.16 }, // Thursday
  { value: 5, weight: 0.15 }, // Friday
  { value: 6, weight: 0.11 }, // Saturday
];

export function getWeightedHour(): number {
  return weightedRandom(hourlyWeights);
}

export function getDayOfWeekMultiplier(dayOfWeek: number): number {
  const weight = dayOfWeekWeights.find(d => d.value === dayOfWeek)?.weight ?? 0.14;
  return weight / 0.14; // Normalize around 1.0
}

export function generateTimestampForDay(day: Date): Date {
  const hour = getWeightedHour();
  const minute = randomInt(0, 59);
  const second = randomInt(0, 59);
  const millisecond = randomInt(0, 999);

  const timestamp = new Date(day);
  timestamp.setHours(hour, minute, second, millisecond);

  return timestamp;
}

export function getSessionCountForDay(baseCount: number, day: Date): number {
  const dayOfWeek = day.getDay();
  const multiplier = getDayOfWeekMultiplier(dayOfWeek);

  // Add some random variance (±20%)
  const variance = 0.8 + Math.random() * 0.4;

  return Math.round(baseCount * multiplier * variance);
}
