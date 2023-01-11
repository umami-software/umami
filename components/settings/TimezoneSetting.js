import { Dropdown, Item, Button } from 'react-basics';
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

  function handleReset() {
    saveTimezone(getTimezone());
  }

  return (
    <>
      <Dropdown items={options} value={timezone} onChange={saveTimezone}>
        {item => <Item key={item}>{item}</Item>}
      </Dropdown>
      <Button onClick={handleReset}>{formatMessage(messages.reset)}</Button>
    </>
  );
}
