import classNames from 'classnames';
import { Button, Icon, Icons, Popup, PopupTrigger, Text } from 'react-basics';
import PopupForm from 'app/(main)/reports/[reportId]/PopupForm';
import FilterSelectForm from 'app/(main)/reports/[reportId]/FilterSelectForm';
import { useFields, useMessages, useNavigation } from 'components/hooks';
import { OPERATOR_PREFIXES } from 'lib/constants';
import styles from './WebsiteFilterButton.module.css';

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
    const prefix = OPERATOR_PREFIXES[operator];

    router.push(renderUrl({ [name]: prefix + value }));
  };

  return (
    <PopupTrigger>
      <Button className={classNames(className, styles.button)} variant="quiet">
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
