import { Button, Dialog, type DialogProps, DialogTrigger, Icon, Sheet } from '@umami/react-zen';
import { Menu } from '@/components/icons';

export function MobileMenuButton(props: DialogProps) {
  return (
    <DialogTrigger>
      <Button>
        <Icon>
          <Menu />
        </Icon>
      </Button>
      <Sheet side="left">
        <Dialog {...props} style={{ width: 'auto' }} />
      </Sheet>
    </DialogTrigger>
  );
}
