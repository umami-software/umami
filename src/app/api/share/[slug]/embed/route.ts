import { ENTITY_TYPE } from '@/lib/constants';
import { json, notFound } from '@/lib/response';
import { getEmbedFrameAncestors } from '@/lib/share';
import { getShareByCode } from '@/queries/prisma';

/**
 * Public, minimal: tells the edge/proxy which origins may frame /embed/<slug>.
 * Exposes no analytics data and no tokens.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const share = await getShareByCode(slug);

  if (!share || share.shareType !== ENTITY_TYPE.board) {
    return notFound();
  }

  const parameters = share.parameters as any;

  return json({
    enabled: parameters?.embed === true,
    frameAncestors: getEmbedFrameAncestors(parameters),
  });
}
