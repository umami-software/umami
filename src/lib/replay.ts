import type { ReplayChunk } from '@/queries/sql';

export function stitchChunkEvents(chunks: ReplayChunk[]): any[] {
  if (!chunks.length) return [];
  const sorted = [...chunks].sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
  const result: any[] = [];
  let timeOffset = 0;
  for (const chunk of sorted) {
    const chunkStartMs = chunk.startedAt.getTime();
    const events = [...chunk.events].sort((a, b) => a.timestamp - b.timestamp);
    for (const event of events) {
      result.push({ ...event, timestamp: timeOffset + (event.timestamp - chunkStartMs) });
    }
    timeOffset += chunk.endedAt.getTime() - chunkStartMs + 1000;
  }
  return result;
}
