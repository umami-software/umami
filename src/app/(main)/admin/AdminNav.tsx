import { Column, Row, Tooltip, TooltipContent, TooltipTrigger } from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
import { NavMenu } from '@/components/common/NavMenu';
import { useAdminNavItems, useMessages, useNavigation } from '@/components/hooks';
import { ArrowLeft } from '@/components/icons';

export function AdminNav({ onItemClick }: { onItemClick?: () => void }) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const { items, selectedKey } = useAdminNavItems();

  return (
    <Column gap="2">
      <Link href={renderUrl('/websites', false)} role="button" onClick={onItemClick}>
        <Tooltip>
          <TooltipTrigger
            delay={0}
            render={
              <Row
                tabIndex={0}
                alignItems="center"
                hover={{ backgroundColor: 'muted' }}
                borderRadius
                minHeight="9"
              />
            }
          >
            <IconLabel icon={<ArrowLeft />} label={t(labels.back)} padding />
          </TooltipTrigger>
          <TooltipContent side="right">{t(labels.back)}</TooltipContent>
        </Tooltip>
      </Link>
      <NavMenu
        items={items}
        selectedKey={selectedKey}
        allowMinimize={false}
        onItemClick={onItemClick}
      />
    </Column>
  );
}
