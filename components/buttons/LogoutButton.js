import { Button, Icon, Icons, PopupTrigger, Tooltip } from 'react-basics';
import Link from 'next/link';
import { labels } from 'components/messages';
import { useIntl } from 'react-intl';

export default function LogoutButton({ tooltipPosition = 'top' }) {
  const { formatMessage } = useIntl();
  return (
    <Link href="/logout">
      <a>
        <PopupTrigger action="hover">
          <Button variant="quiet">
            <Icon>
              <Icons.Logout />
            </Icon>
          </Button>
          <Tooltip position={tooltipPosition}>{formatMessage(labels.logout)}</Tooltip>
        </PopupTrigger>
      </a>
    </Link>
  );
}
