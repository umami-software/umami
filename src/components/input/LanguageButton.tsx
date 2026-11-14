import { Button, Icon, MenuTrigger, Popover } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Globe } from '@/components/icons';
import { LanguageMenu } from '@/components/input/LanguageMenu';

export function LanguageButton() {
  const { t, labels } = useMessages();

  return (
    <MenuTrigger>
      <Button variant="quiet" aria-label={t(labels.language)}>
        <Icon>
          <Globe />
        </Icon>
      </Button>
      <Popover side="top" align="start">
        <LanguageMenu />
      </Popover>
    </MenuTrigger>
  );
}
