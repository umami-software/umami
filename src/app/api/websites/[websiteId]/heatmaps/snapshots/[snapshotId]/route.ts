import { parseRequest } from '@/lib/request';
import { notFound, unauthorized } from '@/lib/response';
import { canViewAuthenticatedWebsite } from '@/permissions';
import { getHeatmapSnapshotImage } from '@/queries/sql/heatmap/ensureHeatmapSnapshot';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; snapshotId: string }> },
) {
  const { auth, error } = await parseRequest(request);
  const { websiteId, snapshotId } = await params;

  if (error) {
    return error();
  }

  if (!(await canViewAuthenticatedWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const snapshot = await getHeatmapSnapshotImage(websiteId, snapshotId);

  if (!snapshot) {
    return notFound({ message: 'Snapshot not found.' });
  }

  return new Response(new Uint8Array(snapshot.imageData), {
    status: 200,
    headers: {
      'Content-Type': snapshot.mimeType,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
