// Fix for issue #3712: Duplicate violates unique constraint "session_pkey" errors in PostgreSQL logs
// File: src/app/api/send/route.ts

// Add error handling for duplicate sessions (around line 137):
/*
// Create a session if not found
if (!clickhouse.enabled && !cache?.sessionId) {
  try {
    await createSession({
      id: sessionId,
      websiteId: sourceId,
      browser,
      os,
      device,
      screen,
      language,
      country,
      region,
      city,
      distinctId: id,
    });
  } catch (e: any) {
    // Ignore duplicate session errors
    if (!e.message.toLowerCase().includes('unique constraint')) {
      throw e;
    }
  }
}
*/