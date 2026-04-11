'use client';
import { Column, Row } from '@umami/react-zen';
import { useState } from 'react';
import { FieldSelectForm } from '@/app/(main)/websites/[websiteId]/(reports)/breakdown/FieldSelectForm';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { useDateRange, useMessages, useResultQuery } from '@/components/hooks';
import { ListCheck } from '@/components/icons';
import { DownloadButton } from '@/components/input/DownloadButton';
import { DialogButton } from '@/components/input/DialogButton';
import { Breakdown } from './Breakdown';

export function BreakdownPage({ websiteId }: { websiteId: string }) {
  const {
    dateRange: { startDate, endDate },
  } = useDateRange();
  const [fields, setFields] = useState(['path']);
  const { data } = useResultQuery<any>(
    'breakdown',
    { websiteId, startDate, endDate, fields },
    { enabled: !!fields.length },
  );
  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <Row alignItems="center" justifyContent="flex-start">
        <FieldsButton value={fields} onChange={setFields} />
      </Row>
      <Panel
        height="900px"
        overflow="auto"
        allowFullscreen
        toolbar={<DownloadButton filename="breakdown" data={data} />}
      >
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
  const { t, labels } = useMessages();

  return (
    <DialogButton
      icon={<ListCheck />}
      label={t(labels.fields)}
      width="400px"
      minHeight="300px"
      variant="outline"
    >
      {({ close }) => {
        return <FieldSelectForm selectedFields={value} onChange={onChange} onClose={close} />;
      }}
    </DialogButton>
  );
};
