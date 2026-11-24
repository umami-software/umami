'use client';
import { DialogTrigger } from '@umami/react-zen';
import type { ReactElement } from 'react';

export function ControlledDialog({ children }: { children: ReactElement }) {
  // TODO(zen-1.0): <DialogTrigger>: old DialogTrigger wrapped trigger + Modal. Restructure to <Dialog><DialogTrigger render={<Button ... />} /><DialogContent>...</DialogContent></Dialog>
  return (
    <DialogTrigger>
      <button type="button" hidden />
      {children}
    </DialogTrigger>
  );
}
