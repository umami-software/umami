import { isOAuthEnabled } from '@/lib/oauth/config';
import {
  buildAuthorizationServerMetadata,
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

  return metadataResponse(buildAuthorizationServerMetadata(request.headers));
}
