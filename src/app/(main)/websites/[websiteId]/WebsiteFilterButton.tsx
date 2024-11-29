import { Button, Icon, Icons, Popup, PopupTrigger, Text } from 'react-basics';
import PopupForm from 'app/(main)/reports/[reportId]/PopupForm';
import FilterSelectForm from 'app/(main)/reports/[reportId]/FilterSelectForm';
import { useFields, useMessages, useNavigation, useDateRange } from 'components/hooks';
import { OPERATOR_PREFIXES } from 'lib/constants';
import styles from './WebsiteFilterButton.module.css';

export function WebsiteFilterButton({
  websiteId,
  className,
  position = 'bottom',
  alignment = 'end',
  showText = true,
}: {
  websiteId: string;
  className?: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
  alignment?: 'end' | 'center' | 'start';
  showText?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl, router } = useNavigation();
  const { fields } = useFields();
  const {
    dateRange: { startDate, endDate },
  } = useDateRange(websiteId);

  const handleAddFilter = ({ name, operator, value }) => {
    const prefix = OPERATOR_PREFIXES[operator];

    router.push(renderUrl({ [name]: prefix + value }));
  };

  return (
    <PopupTrigger className={className}>
      <Button className={styles.button} variant="quiet">
        <Icon>
          <Icons.Plus />
        </Icon>
        {showText && <Text>{formatMessage(labels.filter)}</Text>}
      </Button>
      <Popup position={position} alignment={alignment}>
        {(close: () => void) => {
          return (
            <PopupForm>
              <FilterSelectForm
                websiteId={websiteId}
                fields={fields}
                startDate={startDate}
                endDate={endDate}
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
