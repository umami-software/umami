import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Icon,
} from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Globe } from '@/components/icons';
import { LanguageMenu } from '@/components/input/LanguageMenu';

export function LanguageButton() {
  const { t, labels } = useMessages();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" aria-label={t(labels.language)} />}>
        <Icon>
          <Globe />
        </Icon>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-auto">
        <LanguageMenu />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
