import { z } from 'zod';
import { validateUrl } from '@/lib/og';

export const utmField = z
  .string()
  .max(255)
  .transform(v => (v === '' ? null : v))
  .nullable()
  .optional();

const ogTextField = (max: number) =>
  z
    .string()
    .max(max)
    .transform(v => {
      const trimmed = v.trim();
      return trimmed === '' ? null : trimmed;
    })
    .nullable()
    .optional();

export const ogTitleField = ogTextField(255);
export const ogDescriptionField = ogTextField(500);

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (u.protocol === 'http:' || u.protocol === 'https:') && !!u.host;
  } catch {
    return false;
  }
}

// http(s) URL whose host doesn't resolve to a private/reserved IP literal.
export function isPublicHttpUrl(value: string): boolean {
  return isHttpUrl(value) && validateUrl(value) !== null;
}

export const ogImageField = z
  .string()
  .max(2047)
  .transform(v => {
    const trimmed = v.trim();
    return trimmed === '' ? null : trimmed;
  })
  .nullable()
  .optional()
  .refine(v => v == null || isPublicHttpUrl(v), {
    message: 'ogImage must be a public http(s) URL',
  });
