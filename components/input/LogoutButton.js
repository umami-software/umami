import { Button, Icon, Icons, Tooltip } from 'react-basics';
import Link from 'next/link';
import { labels } from 'components/messages';
import { useIntl } from 'react-intl';

export default function LogoutButton({ tooltipPosition = 'top' }) {
  const { formatMessage } = useIntl();
  return (
    <Link href="/logout">
      <a>
        <Tooltip label={formatMessage(labels.logout)} position={tooltipPosition}>
          <Button variant="quiet">
            <Icon>
              <Icons.Logout />
            </Icon>
          </Button>
        </Tooltip>
      </a>
    </Link>
  );
}
