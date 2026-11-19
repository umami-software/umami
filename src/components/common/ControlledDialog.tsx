'use client';
import { DialogTrigger } from '@umami/react-zen';
import type { ReactElement } from 'react';

export function ControlledDialog({ children }: { children: ReactElement }) {
  return (
    <DialogTrigger>
      <button type="button" hidden />
      {children}
    </DialogTrigger>
  );
}
