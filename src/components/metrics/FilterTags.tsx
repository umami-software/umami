import { MouseEvent } from 'react';
import { Button, Icon, Icons, Popup, PopupTrigger, Text } from 'react-basics';
import {
  useDateRange,
  useFields,
  useNavigation,
  useMessages,
  useFormat,
  useFilters,
} from '@/components/hooks';
import PopupForm from '@/app/(main)/reports/[reportId]/PopupForm';
import FieldFilterEditForm from '@/app/(main)/reports/[reportId]/FieldFilterEditForm';
import { OPERATOR_PREFIXES } from '@/lib/constants';
import { isSearchOperator, parseParameterValue } from '@/lib/params';
import styles from './FilterTags.module.css';
import WebsiteFilterButton from '@/app/(main)/websites/[websiteId]/WebsiteFilterButton';

export function FilterTags({
  websiteId,
  params,
}: {
  websiteId: string;
  params: { [key: string]: string };
}) {
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const { dateRange } = useDateRange(websiteId);
  const {
    router,
    renderUrl,
    query: { view },
  } = useNavigation();
  const { fields } = useFields();
  const { operatorLabels } = useFilters();
  const { startDate, endDate } = dateRange;

  if (Object.keys(params).filter(key => params[key]).length === 0) {
    return null;
  }

  const handleCloseFilter = (param: string, e: MouseEvent) => {
    e.stopPropagation();
    router.push(renderUrl({ [param]: undefined }));
  };

  const handleResetFilter = () => {
    router.push(renderUrl({ view }, true));
  };

  const handleChangeFilter = (
    values: { name: string; operator: string; value: string },
    close: () => void,
  ) => {
    const { name, operator, value } = values;
    const prefix = OPERATOR_PREFIXES[operator];

    router.push(renderUrl({ [name]: prefix + value }));
    close();
  };

  return (
    <div className={styles.filters}>
      <div className={styles.label}>{formatMessage(labels.filters)}</div>
      {Object.keys(params).map(key => {
        if (!params[key]) {
          return null;
        }
        const label = fields.find(f => f.name === key)?.label;
        const { operator, value } = parseParameterValue(params[key]);
        const paramValue = isSearchOperator(operator) ? value : formatValue(value, key);

        return (
          <PopupTrigger key={key}>
            <div key={key} className={styles.tag}>
              <Text className={styles.name}>{label}</Text>
              <Text className={styles.operator}>{operatorLabels[operator]}</Text>
              <Text className={styles.value}>{paramValue}</Text>
              <Icon className={styles.icon} onClick={e => handleCloseFilter(key, e)}>
                <Icons.Close />
              </Icon>
            </div>
            <Popup alignment="start">
              {(close: () => void) => {
                return (
                  <PopupForm>
                    <FieldFilterEditForm
                      label={label}
                      type="string"
                      websiteId={websiteId}
                      name={key}
                      operator={operator}
                      defaultValue={value}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={values => handleChangeFilter(values, close)}
                    />
                  </PopupForm>
                );
              }}
            </Popup>
          </PopupTrigger>
        );
      })}
      <WebsiteFilterButton websiteId={websiteId} alignment="center" showText={false} />
      <Button className={styles.close} variant="quiet" onClick={handleResetFilter}>
        <Icon>
          <Icons.Close />
        </Icon>
        <Text>{formatMessage(labels.clearAll)}</Text>
      </Button>
    </div>
  );
}

export default FilterTags;
