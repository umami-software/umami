import { Row, Text } from '@umami/react-zen';
import { CURRENT_VERSION, HOMEPAGE_URL } from '@/lib/constants';
import type { WhiteLabel } from '@/lib/types';

export function ShareFooter({ whiteLabel }: { whiteLabel?: WhiteLabel }) {
  if (whiteLabel) {
    return (
      <Row as="footer" paddingY="6" justifyContent="flex-end">
        <a href={whiteLabel.url} target="_blank">
          <Text weight="bold">{whiteLabel.name}</Text>
        </a>
      </Row>
    );
  }

  return (
    <Row as="footer" paddingY="6" justifyContent="flex-end">
      <a href={HOMEPAGE_URL} target="_blank">
        <Text weight="bold">umami</Text> {`v${CURRENT_VERSION}`}
      </a>
    </Row>
  );
}
