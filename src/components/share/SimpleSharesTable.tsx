import { type DataTableProps, Row } from '@umami/react-zen';
import { ShareDeleteButton } from '@/app/(main)/websites/[websiteId]/settings/ShareDeleteButton';
import { SharedSharesTable } from './SharedSharesTable';
import { SimpleShareEditButton } from './SimpleShareEditButton';

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
