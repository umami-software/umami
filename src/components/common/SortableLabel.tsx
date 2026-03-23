import { Icon, Row } from '@umami/react-zen';
import { type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from '@/components/icons';
import { useNavigation } from '@/components/hooks';

export interface SortableLabelProps {
  column: string;
  label: ReactNode;
}

export function SortableLabel({ column, label }: SortableLabelProps) {
  const { router, updateParams, query } = useNavigation();
  const currentOrderBy = query.orderBy;
  const currentDesc = query.sortDescending === 'true';
  const isActive = currentOrderBy === column;

  const handleClick = () => {
    let orderBy: string | undefined;
    let sortDescending: string | undefined;

    if (!isActive) {
      // First click: sort descending (highest first)
      orderBy = column;
      sortDescending = 'true';
    } else if (currentDesc) {
      // Second click: sort ascending
      orderBy = column;
      sortDescending = 'false';
    } else {
      // Third click: clear sort (back to default)
      orderBy = undefined;
      sortDescending = undefined;
    }

    router.push(updateParams({ orderBy, sortDescending, page: 1 }));
  };

  return (
    <Row
      alignItems="center"
      gap="1"
      onClick={handleClick}
      data-test={`sort-${column}`}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      {label}
      <Icon size="sm">
        {isActive ? currentDesc ? <ArrowDown /> : <ArrowUp /> : <ArrowUpDown />}
      </Icon>
    </Row>
  );
}
