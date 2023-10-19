import { ok } from 'next-basics';
import { CURRENT_VERSION, TELEMETRY_PIXEL } from 'lib/constants';

export default function handler(req, res) {
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('content-type', 'text/javascript');

    if (process.env.DISABLE_TELEMETRY) {
      return res.send('/* telemetry disabled */');
    }

    const script = `
    (()=>{const i=document.createElement('img');
      i.setAttribute('src','${TELEMETRY_PIXEL}?v=${CURRENT_VERSION}');
      i.setAttribute('style','width:0;height:0;position:absolute;pointer-events:none;');
      document.body.appendChild(i);})();
  `;

    return res.send(script.replace(/\s\s+/g, ''));
  }

  return ok(res);
}
