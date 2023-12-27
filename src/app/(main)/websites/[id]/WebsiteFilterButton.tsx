import { Button, Icon, Icons, Popup, PopupTrigger, Text } from 'react-basics';
import PopupForm from 'app/(main)/reports/[id]/PopupForm';
import FilterSelectForm from 'app/(main)/reports/[id]/FilterSelectForm';
import { useMessages, useNavigation } from 'components/hooks';

export function WebsiteFilterButton({
  websiteId,
  className,
}: {
  websiteId: string;
  className?: string;
}) {
  const { formatMessage, labels } = useMessages();
  const { makeUrl, router } = useNavigation();

  const fieldOptions = [
    { name: 'url', type: 'string', label: formatMessage(labels.url) },
    { name: 'referrer', type: 'string', label: formatMessage(labels.referrer) },
    { name: 'browser', type: 'string', label: formatMessage(labels.browser) },
    { name: 'os', type: 'string', label: formatMessage(labels.os) },
    { name: 'device', type: 'string', label: formatMessage(labels.device) },
    { name: 'country', type: 'string', label: formatMessage(labels.country) },
    { name: 'region', type: 'string', label: formatMessage(labels.region) },
    { name: 'city', type: 'string', label: formatMessage(labels.city) },
  ];

  const handleAddFilter = ({ name, value }) => {
    router.push(makeUrl({ [name]: value }));
  };

  return (
    <PopupTrigger>
      <Button className={className}>
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.filter)}</Text>
      </Button>
      <Popup position="bottom" alignment="start">
        {(close: () => void) => {
          return (
            <PopupForm>
              <FilterSelectForm
                websiteId={websiteId}
                items={fieldOptions}
                onSelect={value => {
                  handleAddFilter(value);
                  close();
                }}
                allowFilterSelect={false}
              />
            </PopupForm>
          );
        }}
      </Popup>
    </PopupTrigger>
  );
}

export default WebsiteFilterButton;
