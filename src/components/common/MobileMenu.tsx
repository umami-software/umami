import { Dialog, DialogTrigger, Button, Icon, Modal, DialogProps } from '@umami/react-zen';
import { Menu } from '@/components/icons';

export function MobileMenu(props: DialogProps) {
  return (
    <DialogTrigger>
      <Button>
        <Icon>
          <Menu />
        </Icon>
      </Button>
      <Modal placement="left" offset="80px">
        <Dialog variant="sheet" {...props} />
      </Modal>
    </DialogTrigger>
  );
}
