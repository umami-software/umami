import { Button, Icon, DialogTrigger, Dialog, Modal } from '@umami/react-zen';
import { Menu } from '@/components/icons';
import { ReactNode } from 'react';

export function MobileMenuButton({ children }: { children: ReactNode }) {
  return (
    <DialogTrigger>
      <Button>
        <Icon>
          <Menu />
        </Icon>
      </Button>
      <Modal position="left" offset="20px">
        <Dialog variant="sheet">{children}</Dialog>
      </Modal>
    </DialogTrigger>
  );
}
