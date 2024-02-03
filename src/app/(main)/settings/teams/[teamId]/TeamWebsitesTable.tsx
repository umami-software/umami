'use client';
import Link from 'next/link';
import { Button, GridColumn, GridTable, Icon, Text } from 'react-basics';
import { useMessages } from 'components/hooks';
import Icons from 'components/icons';

export function TeamWebsitesTable({
  data = [],
}: {
  data: any[];
  readOnly: boolean;
  onRemove: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  return (
    <GridTable data={data}>
      <GridColumn name="name" label={formatMessage(labels.name)} />
      <GridColumn name="domain" label={formatMessage(labels.domain)} />
      <GridColumn name="action" label=" " alignment="end">
        {row => {
          const { websiteId } = row;
          return (
            <Link href={`/websites/${websiteId}`}>
              <Button>
                <Icon>
                  <Icons.Change />
                </Icon>
                <Text>{formatMessage(labels.view)}</Text>
              </Button>
            </Link>
          );
        }}
      </GridColumn>
    </GridTable>
  );
}

export default TeamWebsitesTable;
