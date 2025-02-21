import { CURRENT_VERSION, TELEMETRY_PIXEL } from '@/lib/constants';

export async function GET() {
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.DISABLE_TELEMETRY &&
    process.env.PRIVATE_MODE
  ) {
    const script = `
    (()=>{const i=document.createElement('img');
      i.setAttribute('src','${TELEMETRY_PIXEL}?v=${CURRENT_VERSION}');
      i.setAttribute('style','width:0;height:0;position:absolute;pointer-events:none;');
      document.body.appendChild(i);})();
  `;

    return new Response(script.replace(/\s\s+/g, ''), {
      headers: {
        'content-type': 'text/javascript',
      },
    });
  }

  return new Response('/* telemetry disabled */', {
    headers: {
      'content-type': 'text/javascript',
    },
  });
}
