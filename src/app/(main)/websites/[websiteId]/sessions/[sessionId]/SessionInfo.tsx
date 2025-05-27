import { Icon, TextField, Column, Row, Label, Box, Text } from '@umami/react-zen';
import { useFormat, useLocale, useMessages, useRegionNames, useTimezone } from '@/components/hooks';
import { TypeIcon } from '@/components/common/TypeIcon';
import { Location } from '@/components/icons';

export function SessionInfo({ data }) {
  const { locale } = useLocale();
  const { formatTimezoneDate } = useTimezone();
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const { getRegionName } = useRegionNames(locale);

  return (
    <Column gap="6">
      <Box>
        <Label>ID</Label>
        <TextField value={data?.id} allowCopy />
      </Box>

      <Box>
        <Label>{formatMessage(labels.distinctId)}</Label>
        <Row>{data?.distinctId}</Row>
      </Box>

      <Box>
        <Label>{formatMessage(labels.lastSeen)}</Label>
        <Row>{formatTimezoneDate(data?.lastAt, 'PPPPpp')}</Row>
      </Box>

      <Box>
        <Label>{formatMessage(labels.firstSeen)}</Label>
        <Row>{formatTimezoneDate(data?.firstAt, 'PPPPpp')}</Row>
      </Box>

      <Box>
        <Label>{formatMessage(labels.country)}</Label>
        <Row gap="3">
          <TypeIcon type="country" value={data?.country} />
          <Text>{formatValue(data?.country, 'country')}</Text>
        </Row>
      </Box>

      <Row>
        <Label>{formatMessage(labels.region)}</Label>
        <Row gap="3">
          <Icon>
            <Location />
          </Icon>
          {getRegionName(data?.region)}
        </Row>
      </Row>

      <Box>
        <Label>{formatMessage(labels.city)}</Label>
        <Row gap="3">
          <Icon>
            <Location />
          </Icon>
          <Text>{data?.city}</Text>
        </Row>
      </Box>

      <Box>
        <Label>{formatMessage(labels.os)}</Label>
        <Row gap="3">
          <TypeIcon type="os" value={data?.os?.toLowerCase()?.replaceAll(/\W/g, '-')} />
          <Text>{formatValue(data?.os, 'os')}</Text>
        </Row>
      </Box>

      <Box>
        <Label>{formatMessage(labels.device)}</Label>
        <Row gap="3">
          <TypeIcon type="device" value={data?.device} />
          <Text>{formatValue(data?.device, 'device')}</Text>
        </Row>
      </Box>

      <Box>
        <Label>{formatMessage(labels.browser)}</Label>
        <Row gap="3">
          <TypeIcon type="browser" value={data?.browser} />
          <Text>{formatValue(data?.browser, 'browser')}</Text>
        </Row>
      </Box>
    </Column>
  );
}
