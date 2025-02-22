import { ReactNode } from 'react';
import { Grid, Column } from '@umami/react-zen';
import { MenuNav } from '@/components/layout/MenuNav';

export function MenuLayout({ items = [], children }: { items: any[]; children: ReactNode }) {
  const cloudMode = !!process.env.cloudMode;

  return (
    <Grid columns="auto 1fr" gap="5">
      {!cloudMode && (
        <Column width="240px">
          <MenuNav items={items} shallow={true} />
        </Column>
      )}
      <Column>{children}</Column>
    </Grid>
  );
}
