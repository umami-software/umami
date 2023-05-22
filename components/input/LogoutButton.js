import { Button, Icon, Icons, Tooltip } from 'react-basics';
import Link from 'next/link';
import useMessages from 'hooks/useMessages';

export function LogoutButton({ tooltipPosition = 'top' }) {
  const { formatMessage, labels } = useMessages();
  return (
    <Link href="/logout">
      <Tooltip label={formatMessage(labels.logout)} position={tooltipPosition}>
        <Button variant="quiet">
          <Icon>
            <Icons.Logout />
          </Icon>
        </Button>
      </Tooltip>
    </Link>
  );
}

export default LogoutButton;
