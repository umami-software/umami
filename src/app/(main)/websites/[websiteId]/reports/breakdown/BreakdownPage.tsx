'use client';
import { useState } from 'react';
import {
  List,
  ListItem,
  Button,
  Column,
  Box,
  Grid,
  Text,
  Icon,
  Popover,
  DialogTrigger,
} from '@umami/react-zen';
import { useDateRange, useMessages, useFields } from '@/components/hooks';
import { SquarePlus, Chevron } from '@/components/icons';
import { Panel } from '@/components/common/Panel';
import { Breakdown } from './Breakdown';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';

export function BreakdownPage({ websiteId }: { websiteId: string }) {
  const {
    dateRange: { startDate, endDate },
  } = useDateRange(websiteId);
  const [fields, setFields] = useState(['url']);

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <Box>
        <FieldsButton value={fields} onChange={setFields} />
      </Box>
      <Panel height="900px" overflow="auto" allowFullscreen>
        <Breakdown
          websiteId={websiteId}
          startDate={startDate}
          endDate={endDate}
          parameters={{ fields }}
        />
      </Panel>
    </Column>
  );
}

const FieldsButton = ({ value, onChange }) => {
  const [selected, setSelected] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const { formatMessage, labels } = useMessages();
  const { fields } = useFields();

  const handleChange = value => {
    setSelected(value);
  };

  const handleApply = () => {
    setIsOpen(false);
    onChange?.(selected);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelected(value);
  };

  return (
    <DialogTrigger>
      <Button variant="quiet" onPress={() => setIsOpen(!isOpen)}>
        <Icon>
          <SquarePlus />
        </Icon>
        <Text>Fields</Text>
        <Icon rotate={90}>
          <Chevron />
        </Icon>
      </Button>
      <Popover placement="bottom start" isOpen={isOpen}>
        <Column width="300px" padding="2" border borderRadius shadow="3" backgroundColor gap>
          <List value={selected} onChange={handleChange} selectionMode="multiple">
            {fields.map(({ name, label }) => {
              return (
                <ListItem key={name} id={name}>
                  {label}
                </ListItem>
              );
            })}
          </List>
          <Grid columns="1fr 1fr" gap>
            <Button onPress={handleClose}>{formatMessage(labels.cancel)}</Button>
            <Button onPress={handleApply} variant="primary">
              {formatMessage(labels.apply)}
            </Button>
          </Grid>
        </Column>
      </Popover>
    </DialogTrigger>
  );
};
