'use client';
import { Column, Row } from '@umami/react-zen';
import { useState } from 'react';
import { ExpandedViewModal } from '@/app/(main)/websites/[websiteId]/ExpandedViewModal';
import { GridRow } from '@/components/common/GridRow';
import { Panel } from '@/components/common/Panel';
import { useMobile } from '@/components/hooks';
import { DialogButton } from '@/components/input/DialogButton';
import { UnitFilter } from '@/components/input/UnitFilter';
import type { AnnotationRange } from '@/lib/annotations';
import { AnnotationsButton } from './annotations/AnnotationsButton';
import { AnnotationsModal } from './annotations/AnnotationsModal';
import { WebsiteChart } from './WebsiteChart';
import { WebsiteControls } from './WebsiteControls';
import { WebsiteGlobe } from './WebsiteGlobe';
import { WebsiteMetricsBar } from './WebsiteMetricsBar';
import { WebsitePanels } from './WebsitePanels';

export function WebsitePage({ websiteId }: { websiteId: string }) {
  const [annotationRange, setAnnotationRange] = useState<AnnotationRange | null>(null);
  const { isMobile } = useMobile();

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} allowBounceFilter={true} />
      <WebsiteMetricsBar websiteId={websiteId} showChange={true} />
      <GridRow layout="two-one">
        <Panel minHeight="520px" gridColumn={isMobile ? null : 'span 2'}>
          <Row justifyContent="end">
            <UnitFilter />
          </Row>
          <WebsiteChart
            websiteId={websiteId}
            showAnnotations
            onAnnotationMoreClick={setAnnotationRange}
            legendActions={<AnnotationsButton websiteId={websiteId} />}
          />
        </Panel>
        <WebsiteGlobe websiteId={websiteId} />
      </GridRow>
      <WebsitePanels websiteId={websiteId} />
      <ExpandedViewModal websiteId={websiteId} />
      <DialogButton
        isOpen={!!annotationRange}
        onOpenChange={isOpen => !isOpen && setAnnotationRange(null)}
        title={null}
        width="800px"
      >
        {({ close }) =>
          annotationRange && (
            <AnnotationsModal
              websiteId={websiteId}
              range={annotationRange}
              onClose={() => {
                close();
                setAnnotationRange(null);
              }}
            />
          )
        }
      </DialogButton>
    </Column>
  );
}
