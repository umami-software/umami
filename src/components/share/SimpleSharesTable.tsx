import { ShareDeleteButton } from '@/app/(main)/websites/[websiteId]/settings/ShareDeleteButton';
import { Row, type DataTableProps } from '@umami/react-zen';
import { SimpleShareEditButton } from './SimpleShareEditButton';
import { SharedSharesTable } from './SharedSharesTable';

export function SimpleSharesTable(props: DataTableProps) {
  return (
    <SharedSharesTable
      data={props.data as any[]}
      renderActions={({ id, slug }) => (
          <Row>
            <SimpleShareEditButton shareId={id} />
            <ShareDeleteButton shareId={id} slug={slug} />
          </Row>
        )}
    />
  );
}
