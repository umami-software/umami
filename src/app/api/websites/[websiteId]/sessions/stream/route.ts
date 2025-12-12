import { initializeRedisSubscriber, subscribeToSessions } from '@/lib/session-events';
import { parseRequest } from '@/lib/request';
import { unauthorized } from '@/lib/response';
import { canViewWebsite } from '@/permissions';

const HEARTBEAT_INTERVAL = 30000;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  await initializeRedisSubscriber();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

      const unsubscribe = subscribeToSessions(websiteId, (_, sessionId) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sessionId })}\n\n`));
      });

      heartbeatTimer = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, HEARTBEAT_INTERVAL);

      request.signal.addEventListener('abort', () => {
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
        }
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
