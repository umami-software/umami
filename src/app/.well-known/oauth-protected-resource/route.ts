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

export async function GET(request: Request) {
  if (!isOAuthEnabled()) {
    return notFound();
  }

  return metadataResponse(buildProtectedResourceMetadata(request.headers));
}
