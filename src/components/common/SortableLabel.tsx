'use client';

import { Icon } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { useNavigation } from '@/components/hooks';
import { ChevronDown, ChevronUp } from '@/components/icons';

type SortDirection = 'asc' | 'desc';

export interface SortableLabelProps {
  label: ReactNode;
  sortKey: string;
  defaultDirection?: SortDirection;
  /**
   * Sorts in local state instead of the URL, for a table that sorts rows it already holds.
   * Receives the next direction; pair it with `direction`.
   */
  onSort?: (direction: SortDirection) => void;
  /** The current direction when this column is the sorted one. Only read with `onSort`. */
  direction?: SortDirection | null;
}

export function SortableLabel({
  label,
  sortKey,
  defaultDirection = 'asc',
  onSort,
  direction: localDirection,
}: SortableLabelProps) {
  const { router, query, updateParams } = useNavigation();
  const isActive = onSort ? !!localDirection : query.orderBy === sortKey;
  const isDescending = onSort ? localDirection === 'desc' : query.sortDescending === 'true';
  const direction = isActive ? (isDescending ? 'desc' : 'asc') : undefined;
  const activeColor = 'var(--foreground)';

  const getNextDirection = (): SortDirection => {
    if (!isActive) {
      return defaultDirection;
    }

    return direction === 'desc' ? 'asc' : 'desc';
  };

  const handleSort = () => {
    const nextDirection = getNextDirection();

    if (onSort) {
      onSort(nextDirection);
      return;
    }

    router.push(
      updateParams({
        orderBy: sortKey,
        sortDescending: nextDirection === 'desc' ? 'true' : undefined,
        page: 1,
      }),
    );
  };

  return (
    <button
      type="button"
      onClick={handleSort}
      className="inline-flex appearance-none items-center gap-1 border-0 bg-transparent p-0 text-inherit"
      aria-pressed={isActive}
    >
      <span>{label}</span>
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          gap: 0,
          lineHeight: 0,
          color: 'var(--muted-foreground)',
          opacity: 0.8,
        }}
      >
        <span
          style={{
            color: direction === 'asc' ? activeColor : undefined,
            opacity: direction === 'asc' ? 1 : 0.55,
            transform: 'scale(0.9)',
            transformOrigin: 'center',
          }}
        >
          <Icon size="sm" color={direction === 'asc' ? undefined : 'muted-foreground'}>
            <ChevronUp />
          </Icon>
        </span>
        <span
          style={{
            color: direction === 'desc' ? activeColor : undefined,
            opacity: direction === 'desc' ? 1 : 0.55,
            marginTop: '-6px',
            transform: 'scale(0.9)',
            transformOrigin: 'center',
          }}
        >
          <Icon size="sm" color={direction === 'desc' ? undefined : 'muted-foreground'}>
            <ChevronDown />
          </Icon>
        </span>
      </span>
    </button>
  );
}
