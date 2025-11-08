'use client';
import { FieldSelectForm } from '@/app/(main)/websites/[websiteId]/(reports)/breakdown/FieldSelectForm';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { useDateRange, useMessages, useMobile } from '@/components/hooks';
import { ListCheck } from '@/components/icons';
import { DialogButton } from '@/components/input/DialogButton';
import { Column, Row } from '@umami/react-zen';
import { useState } from 'react';
import { Breakdown } from './Breakdown';

export function BreakdownPage({ websiteId }: { websiteId: string }) {
  const {
    dateRange: { startDate, endDate },
  } = useDateRange();
  const [fields, setFields] = useState(['path']);
  const { isMobile } = useMobile();

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <Row alignItems="center" justifyContent={isMobile ? 'flex-end' : 'flex-start'}>
        <FieldsButton value={fields} onChange={setFields} />
      </Row>
      <Panel height="900px" overflow="auto" allowFullscreen>
        <Breakdown
          websiteId={websiteId}
          startDate={startDate}
          endDate={endDate}
          selectedFields={fields}
        />
      </Panel>
    </Column>
  );
}

const FieldsButton = ({ value, onChange }) => {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogButton
      icon={<ListCheck />}
      label={formatMessage(labels.fields)}
      width="800px"
      minHeight="300px"
    >
      {({ close }) => {
        return <FieldSelectForm selectedFields={value} onChange={onChange} onClose={close} />;
      }}
    </DialogButton>
  );
};
