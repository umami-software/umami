import { Row, type DataTableProps } from '@umami/react-zen';
import { ShareDeleteButton } from '@/app/(main)/websites/[websiteId]/settings/ShareDeleteButton';
import { SimpleShareEditButton } from '@/components/share/SimpleShareEditButton';
import { SharedSharesTable } from '@/components/share/SharedSharesTable';

export function BoardSharesTable(props: DataTableProps) {
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
