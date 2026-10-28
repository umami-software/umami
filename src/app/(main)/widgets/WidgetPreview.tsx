'use client';
import { useEffect, useRef, useState } from 'react';
import type { WidgetConfig, WidgetType } from '@/lib/marketing-widgets';

/**
 * Renders a widget with the real loader inside a sandboxed iframe (preview mode),
 * so what you see here is exactly what visitors get.
 */
export function WidgetPreview({
  type,
  config,
  width = 340,
  height = 200,
  scale = 1,
  open = true,
  debounce = 0,
}: {
  type: WidgetType;
  config: WidgetConfig;
  width?: number;
  height?: number;
  scale?: number;
  open?: boolean;
  debounce?: number;
}) {
  const [html, setHtml] = useState('');
  const [visible, setVisible] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Build the preview only once it is (almost) on screen: catalogs can hold dozens of previews.
  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => {
      const preview = {
        api: `${window.location.origin}${process.env.basePath || ''}`,
        open,
        widgets: [
          {
            id: 'preview',
            type,
            config: {
              ...config,
              trigger: 'immediate',
              frequency: 'always',
              urlInclude: '',
              urlExclude: '',
              startAt: '',
              endAt: '',
            },
          },
        ],
      };
      const lines = [70, 92, 55, 80, 62]
        .map(
          w =>
            `<div style="height:8px;width:${w}%;background:#dbe3f3;border-radius:4px;margin:10px 0"></div>`,
        )
        .join('');
      setHtml(
        `<!doctype html><html><body style="margin:0;height:100vh;overflow:hidden;background:linear-gradient(135deg,#eef2fb,#f9fafe);font-family:system-ui"><div style="padding:22px 24px"><div style="height:14px;width:34%;background:#c5d0e8;border-radius:5px;margin-bottom:16px"></div>${lines}</div><script>window.__UMAMI_W_PREVIEW=${JSON.stringify(preview).replace(/</g, '\\u003c')}</script><script src="${window.location.origin}${process.env.basePath || ''}/w.js"></script></body></html>`,
      );
    }, debounce);
    return () => clearTimeout(id);
  }, [type, config, open, debounce, visible]);

  const w = Math.round(width / scale);
  const h = Math.round(height / scale);

  return (
    <div
      ref={box}
      style={{
        width,
        height,
        overflow: 'hidden',
        borderRadius: 14,
        border: '1px solid var(--zen-border)',
        background: '#fff',
        position: 'relative',
      }}
    >
      <iframe
        title="Widget preview"
        sandbox="allow-scripts"
        srcDoc={html}
        tabIndex={-1}
        style={{
          width: w,
          height: h,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          pointerEvents: scale < 1 ? 'none' : 'auto',
        }}
      />
    </div>
  );
}
