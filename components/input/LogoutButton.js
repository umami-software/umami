import { Button, Icon, Icons, TooltipPopup } from 'react-basics';
import Link from 'next/link';
import useMessages from 'hooks/useMessages';

export function LogoutButton({ tooltipPosition = 'top' }) {
  const { formatMessage, labels } = useMessages();
  return (
    <Link href="/logout">
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
