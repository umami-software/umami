import { z } from 'zod';
import * as send from '@/app/api/send/route';
import { parseRequest } from '@/lib/request';
import { json, serverError } from '@/lib/response';

const schema = z.array(z.object({}).passthrough());

export async function POST(request: Request) {
  try {
    const { body, error } = await parseRequest(request, schema, { skipAuth: true });

    if (error) {
      return error();
    }

    const errors = [];

    let index = 0;
    for (const data of body) {
      const newRequest = new Request(request, { body: JSON.stringify(data) });
      const response = await send.POST(newRequest);

      if (!response.ok) {
        errors.push({ index, response: await response.json() });
      }

      index++;
    }

    return json({
      size: body.length,
      processed: body.length - errors.length,
      errors: errors.length,
      details: errors,
    });
  } catch (e) {
    return serverError(e);
  }
}
