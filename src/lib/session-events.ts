type SessionListener = (websiteId: string, sessionId: string) => void;

const listeners = new Map<string, Set<SessionListener>>();

export function subscribeToSessions(websiteId: string, callback: SessionListener) {
  if (!listeners.has(websiteId)) {
    listeners.set(websiteId, new Set());
  }
  listeners.get(websiteId).add(callback);

  return () => {
    listeners.get(websiteId)?.delete(callback);
  };
}

export function emitSessionCreated(websiteId: string, sessionId: string) {
  listeners.get(websiteId)?.forEach(cb => cb(websiteId, sessionId));
}
