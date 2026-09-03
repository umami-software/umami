import { isOAuthEnabled } from '@/lib/oauth/config';
import {
  buildProtectedResourceMetadata,
  corsPreflight,
  metadataResponse,
} from '@/lib/oauth/metadata';
import { notFound } from '@/lib/response';

export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return corsPreflight();
}

/** Path-scoped protected resource metadata for the MCP endpoint (RFC 9728 §3.1). */
export async function GET(request: Request) {
  if (!isOAuthEnabled()) {
    return notFound();
  }

  return metadataResponse(buildProtectedResourceMetadata(request.headers));
}
