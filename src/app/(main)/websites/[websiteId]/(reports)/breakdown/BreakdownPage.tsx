'use client';
import { useState } from 'react';
import { Button, Column, Box, Text, Icon, DialogTrigger, Modal, Dialog } from '@umami/react-zen';
import { useDateRange, useMessages } from '@/components/hooks';
import { ListCheck } from '@/components/icons';
import { Panel } from '@/components/common/Panel';
import { Breakdown } from './Breakdown';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { FieldSelectForm } from '@/app/(main)/websites/[websiteId]/(reports)/breakdown/FieldSelectForm';
import { SectionHeader } from '@/components/common/SectionHeader';

export function BreakdownPage({ websiteId }: { websiteId: string }) {
  const {
    dateRange: { startDate, endDate },
  } = useDateRange(websiteId);
  const [fields, setFields] = useState(['path']);

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <SectionHeader>
        <FieldsButton value={fields} onChange={setFields} />
      </SectionHeader>
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
    <Box>
      <DialogTrigger>
        <Button variant="primary">
          <Icon>
            <ListCheck />
          </Icon>
          <Text>Fields</Text>
        </Button>
        <Modal>
          <Dialog title={formatMessage(labels.fields)} style={{ width: 400 }}>
            {({ close }) => (
              <FieldSelectForm selectedFields={value} onChange={onChange} onClose={close} />
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    </Box>
  );
};
