import { Button, Icon, Icons, TooltipPopup } from 'react-basics';
import Link from 'next/link';
import useMessages from 'components/hooks/useMessages';

export function LogoutButton({
  tooltipPosition = 'top',
}: {
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const { formatMessage, labels } = useMessages();
  return (
    <Link href="/src/app/logout/logout">
      <TooltipPopup label={formatMessage(labels.logout)} position={tooltipPosition}>
        <Button variant="quiet">
          <Icon>
            <Icons.Logout />
          </Icon>
        </Button>
      </TooltipPopup>
    </Link>
  );
}

export default LogoutButton;
