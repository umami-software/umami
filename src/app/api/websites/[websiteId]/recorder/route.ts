import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';
import { getWebsite } from '@/queries/prisma';

interface ReplayConfig {
  sampleRate?: number;
  maskLevel?: string;
  maxDuration?: number;
  blockSelector?: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { error } = await parseRequest(request, null, { skipAuth: true });

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const website = await getWebsite(websiteId);

  const headers = {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
  };

  if (!website || !website.replayEnabled) {
    return Response.json({ enabled: false }, { headers });
  }

  const config = (website.replayConfig as ReplayConfig) || {};

  return Response.json(
    {
      enabled: true,
      sampleRate: config.sampleRate ?? 0.15,
      maskLevel: config.maskLevel ?? 'moderate',
      maxDuration: config.maxDuration ?? 300000,
      blockSelector: config.blockSelector ?? '',
    },
    { headers },
  );
}
