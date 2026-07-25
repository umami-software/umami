import { getRecorderConfig } from '@/lib/recorder';
import { parseRequest } from '@/lib/request';
import { getWebsite } from '@/queries/prisma';

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

  if (!website || !website.recorderEnabled) {
    return Response.json({ enabled: false }, { headers });
  }

  const config = getRecorderConfig(website.replayConfig);

  return Response.json(
    {
      enabled: true,
      replayEnabled: config.replayEnabled === true,
      heatmapEnabled: config.heatmapEnabled === true,
      sampleRate: config.sampleRate ?? 0.15,
      heatmapSampleRate: config.heatmapSampleRate ?? 0.15,
      maskLevel: config.maskLevel ?? 'moderate',
      maxDuration: config.maxDuration ?? 300000,
      blockSelector: config.blockSelector ?? '',
    },
    { headers },
  );
}
