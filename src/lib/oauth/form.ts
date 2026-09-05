/**
 * OAuth token/revocation/registration endpoints accept `application/x-www-form-urlencoded`
 * (per RFC 6749) and, for convenience, JSON.
 */
export async function readOAuthBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const body = await request.json();

      return body && typeof body === 'object' && !Array.isArray(body) ? body : {};
    }

    const text = await request.text();
    const params = new URLSearchParams(text);
    const result: Record<string, unknown> = {};

    for (const [key, value] of params) {
      if (!(key in result)) {
        result[key] = value;
      }
    }

    return result;
  } catch {
    return {};
  }
}
