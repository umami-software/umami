export function isErrorTrackingEnabled(website: { id: string; errorsEnabled: boolean }) {
  return website.errorsEnabled || website.id === process.env.selfTrack;
}
