'use client';
import { Column } from '@umami/react-zen';
import { useState } from 'react';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { Heatmap } from './Heatmap';

export function HeatmapsPage({ websiteId }: { websiteId: string }) {
  const [urlPath, setUrlPath] = useState<string>('');

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <Panel height="900px" allowFullscreen>
        <Heatmap websiteId={websiteId} urlPath={urlPath} onUrlPathChange={setUrlPath} />
      </Panel>
    </Column>
  );
}
