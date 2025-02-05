import { json } from '@/lib/response';
import { CURRENT_VERSION } from '@/lib/constants';

export async function GET() {
  return json({ version: CURRENT_VERSION });
}
