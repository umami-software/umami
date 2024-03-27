import { Button, Icon, Icons, Popup, PopupTrigger, Text } from 'react-basics';
import PopupForm from 'app/(main)/reports/[reportId]/PopupForm';
import FilterSelectForm from 'app/(main)/reports/[reportId]/FilterSelectForm';
import { useFields, useMessages, useNavigation } from 'components/hooks';
import { OPERATORS } from 'lib/constants';

export function WebsiteFilterButton({
  websiteId,
  className,
}: {
  websiteId: string;
  className?: string;
}) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl, router } = useNavigation();
  const { fields } = useFields();

  const handleAddFilter = ({ name, operator, value }) => {
    let prefix = '';

    if (operator === OPERATORS.notEquals) {
      prefix = '!';
    } else if (operator === OPERATORS.contains) {
      prefix = '~';
    } else if (operator === OPERATORS.doesNotContain) {
      prefix = '!~';
    }

    router.push(renderUrl({ [name]: prefix + value }));
  };

  return (
    <PopupTrigger>
      <Button className={className}>
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.filter)}</Text>
      </Button>
      <Popup position="bottom" alignment="end">
        {(close: () => void) => {
          return (
            <PopupForm>
              <FilterSelectForm
                websiteId={websiteId}
                fields={fields}
                onChange={value => {
                  handleAddFilter(value);
                  close();
                }}
              />
            </PopupForm>
          );
        }}
      </Popup>
    </PopupTrigger>
  );
}

export default WebsiteFilterButton;
