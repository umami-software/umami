import { useContext } from 'react';
import { safeDecodeURIComponent } from 'next-basics';
import { useMessages, useFormat, useFilters, useFields } from 'components/hooks';
import Icons from 'components/icons';
import { Button, FormRow, Icon, Popup, PopupTrigger } from 'react-basics';
import FilterSelectForm from '../[reportId]/FilterSelectForm';
import ParameterList from '../[reportId]/ParameterList';
import PopupForm from '../[reportId]/PopupForm';
import { ReportContext } from './Report';
import { OPERATORS } from 'lib/constants';
import FieldFilterEditForm from '../[reportId]/FieldFilterEditForm';
import styles from './FilterParameters.module.css';

export function FilterParameters() {
  const { report, updateReport } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const { filterLabels } = useFilters();
  const { parameters } = report || {};
  const { websiteId, filters } = parameters || {};
  const { fields } = useFields();

  const handleAdd = (value: { name: any }) => {
    if (!filters.find(({ name }) => name === value.name)) {
      updateReport({ parameters: { filters: filters.concat(value) } });
    }
  };

  const handleRemove = (name: string) => {
    updateReport({ parameters: { filters: filters.filter(f => f.name !== name) } });
  };

  const handleChange = filter => {
    updateReport({
      parameters: {
        filters: filters.map(f => {
          if (filter.name === f.name) {
            return filter;
          }
          return f;
        }),
      },
    });
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
              fields={fields.filter(({ name }) => !filters.find(f => f.name === name))}
              onChange={handleAdd}
            />
          </PopupForm>
        </Popup>
      </PopupTrigger>
    );
  };

  return (
    <FormRow label={formatMessage(labels.filters)} action={<AddButton />}>
      <ParameterList>
        {filters.map(({ name, filter, value }: { name: string; filter: string; value: string }) => {
          const label = fields.find(f => f.name === name)?.label;
          const isEquals = [OPERATORS.equals, OPERATORS.notEquals].includes(filter as any);
          return (
            <ParameterList.Item key={name} onRemove={() => handleRemove(name)}>
              <FilterParameter
                name={name}
                label={label}
                filter={filterLabels[filter]}
                value={isEquals ? formatValue(value, name) : value}
                onChange={handleChange}
              />
            </ParameterList.Item>
          );
        })}
      </ParameterList>
    </FormRow>
  );
}

const FilterParameter = ({ name, label, filter, value, type = 'string', onChange }) => {
  return (
    <PopupTrigger>
      <div className={styles.item}>
        <div className={styles.label}>{label}</div>
        <div className={styles.filter}>{filter}</div>
        <div className={styles.value}>{safeDecodeURIComponent(value)}</div>
      </div>
      <Popup className={styles.edit} alignment="start">
        <PopupForm>
          <FieldFilterEditForm
            name={name}
            label={label}
            type={type}
            defaultValue={value}
            onChange={onChange}
          />
        </PopupForm>
      </Popup>
    </PopupTrigger>
  );
};

export default FilterParameters;
