import { useMessages, useFormat, useFilters } from 'components/hooks';
import Icons from 'components/icons';
import { useContext } from 'react';
import { Button, FormRow, Icon, Popup, PopupTrigger } from 'react-basics';
import FilterSelectForm from '../[reportId]/FilterSelectForm';
import ParameterList from '../[reportId]/ParameterList';
import PopupForm from '../[reportId]/PopupForm';
import { ReportContext } from '../[reportId]/Report';
import styles from './InsightsFilterParameters.module.css';
import { safeDecodeURIComponent } from 'next-basics';
import { OPERATORS } from 'lib/constants';

export function InsightsFilterParameters() {
  const { report, updateReport } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const { filterLabels } = useFilters();
  const { parameters } = report || {};
  const { websiteId, filters } = parameters || {};

  const fieldOptions = [
    { name: 'url', type: 'string', label: formatMessage(labels.url) },
    { name: 'title', type: 'string', label: formatMessage(labels.pageTitle) },
    { name: 'referrer', type: 'string', label: formatMessage(labels.referrer) },
    { name: 'query', type: 'string', label: formatMessage(labels.query) },
    { name: 'browser', type: 'string', label: formatMessage(labels.browser) },
    { name: 'os', type: 'string', label: formatMessage(labels.os) },
    { name: 'device', type: 'string', label: formatMessage(labels.device) },
    { name: 'country', type: 'string', label: formatMessage(labels.country) },
    { name: 'region', type: 'string', label: formatMessage(labels.region) },
    { name: 'city', type: 'string', label: formatMessage(labels.city) },
  ];

  const handleAdd = (value: { name: any }) => {
    if (!filters.find(({ name }) => name === value.name)) {
      updateReport({ parameters: { filters: filters.concat(value) } });
    }
  };

  const handleRemove = (name: string) => {
    updateReport({ parameters: { filters: filters.filter(f => f.name !== name) } });
  };

  const AddButton = () => {
    return (
      <PopupTrigger>
        <Button size="sm">
          <Icon>
            <Icons.Plus />
          </Icon>
        </Button>
        <Popup position="bottom" alignment="start">
          <PopupForm>
            <FilterSelectForm
              websiteId={websiteId}
              fields={fieldOptions.filter(({ name }) => !filters.find(f => f.name === name))}
              onSelect={handleAdd}
            />
          </PopupForm>
        </Popup>
      </PopupTrigger>
    );
  };

  return (
    <FormRow label={formatMessage(labels.filters)} action={<AddButton />}>
      <ParameterList>
        {filters.map(({ name, filter, value }) => {
          const label = fieldOptions.find(f => f.name === name)?.label;
          const isEquals = [OPERATORS.equals, OPERATORS.notEquals].includes(filter);
          return (
            <ParameterList.Item key={name} onRemove={() => handleRemove(name)}>
              <div className={styles.item}>
                <div className={styles.label}>{label}</div>
                <div className={styles.filter}>{filterLabels[filter]}</div>
                <div className={styles.value}>
                  {safeDecodeURIComponent(isEquals ? formatValue(value, name) : value)}
                </div>
              </div>
            </ParameterList.Item>
          );
        })}
      </ParameterList>
    </FormRow>
  );
}

export default InsightsFilterParameters;
