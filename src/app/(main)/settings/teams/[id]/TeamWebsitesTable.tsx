import Link from 'next/link';
import { Button, GridColumn, GridTable, Icon, Icons, Text } from 'react-basics';
import { useMessages } from 'components/hooks';

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
          const { id: websiteId } = row;
          return (
            <Link href={`/websites/${websiteId}`}>
              <Button>
                <Icon>
                  <Icons.External />
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
