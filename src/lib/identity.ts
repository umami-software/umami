/**
 * Resolves the value stored as a session/event `visitor_id`.
 *
 * Default (banner-free): the server-derived anonymous fingerprint id, which the
 * /api/send endpoint computes from the request (sourceId + ip + user-agent +
 * rotating salt). Nothing is stored on the device.
 *
 * Opt-in (data-identity-stitching="true"): a persistent client id from
 * localStorage, used to bridge anonymous activity across devices / salt windows.
 * This requires consent and is never sent unless the site explicitly enables it.
 */
export function resolveVisitorId({
  clientVid,
  fingerprintId,
}: {
  clientVid?: string;
  fingerprintId: string;
}): string {
  return clientVid || fingerprintId;
}
