import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Icon,
} from '@umami/react-zen';
import type { ReactNode } from 'react';
import { Ellipsis } from '@/components/icons';

/** An ellipsis button that opens a dropdown of `DropdownMenuItem` children. */
export function MenuButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" aria-label="menu" disabled={disabled} />}
      >
        <Icon>
          <Ellipsis />
        </Icon>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        className="w-auto"
        style={{ minWidth: '140px' }}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
