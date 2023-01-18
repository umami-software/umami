import { Dropdown, Item, Button, Flexbox } from 'react-basics';
import { useIntl, defineMessages } from 'react-intl';
import { listTimeZones } from 'timezone-support';
import useTimezone from 'hooks/useTimezone';
import { getTimezone } from 'lib/date';

const messages = defineMessages({
  reset: { id: 'label.reset', defaultMessage: 'Reset' },
});

export default function TimezoneSetting() {
  const { formatMessage } = useIntl();
  const [timezone, saveTimezone] = useTimezone();
  const options = listTimeZones();

  const handleReset = () => saveTimezone(getTimezone());

  return (
    <Flexbox width={400} gap={10}>
      <Dropdown
        items={options}
        value={timezone}
        onChange={saveTimezone}
        menuProps={{ style: { height: 300, width: 300 } }}
      >
        {item => <Item key={item}>{item}</Item>}
      </Dropdown>
      <Button onClick={handleReset}>{formatMessage(messages.reset)}</Button>
    </Flexbox>
  );
}
