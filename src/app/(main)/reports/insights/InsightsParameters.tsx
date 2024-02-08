import { useFilters, useFormat, useMessages } from 'components/hooks';
import Icons from 'components/icons';
import { useContext } from 'react';
import {
  Form,
  FormButtons,
  FormRow,
  Icon,
  Popup,
  PopupTrigger,
  SubmitButton,
  TooltipPopup,
} from 'react-basics';
import BaseParameters from '../[reportId]/BaseParameters';
import FieldSelectForm from '../[reportId]/FieldSelectForm';
import FilterSelectForm from '../[reportId]/FilterSelectForm';
import ParameterList from '../[reportId]/ParameterList';
import PopupForm from '../[reportId]/PopupForm';
import { ReportContext } from '../[reportId]/Report';
import styles from './InsightsParameters.module.css';

export function InsightsParameters() {
  const { report, runReport, updateReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const { filterLabels } = useFilters();
  const { id, parameters } = report || {};
  const { websiteId, dateRange, fields, filters } = parameters || {};
  const { startDate, endDate } = dateRange || {};
  const parametersSelected = websiteId && startDate && endDate;
  const queryEnabled = websiteId && dateRange && (fields?.length || filters?.length);

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

  const parameterGroups = [
    { id: 'fields', label: formatMessage(labels.fields) },
    { id: 'filters', label: formatMessage(labels.filters) },
  ];

  const parameterData = {
    fields,
    filters,
  };

  const handleSubmit = values => {
    runReport(values);
  };

  const handleAdd = (id, value) => {
    const data = parameterData[id];

    if (!data.find(({ name }) => name === value.name)) {
      updateReport({ parameters: { [id]: data.concat(value) } });
    }
  };

  const handleRemove = (id, index) => {
    const data = [...parameterData[id]];
    data.splice(index, 1);
    updateReport({ parameters: { [id]: data } });
  };

  const AddButton = ({ id, onAdd }) => {
    return (
      <PopupTrigger>
        <TooltipPopup label={formatMessage(labels.add)} position="top">
          <Icon>
            <Icons.Plus />
          </Icon>
        </TooltipPopup>
        <Popup position="bottom" alignment="start" className={styles.popup}>
          <PopupForm>
            {id === 'fields' && (
              <FieldSelectForm
                fields={fieldOptions}
                onSelect={onAdd.bind(null, id)}
                showType={false}
              />
            )}
            {id === 'filters' && (
              <FilterSelectForm
                websiteId={websiteId}
                items={fieldOptions}
                onSelect={onAdd.bind(null, id)}
              />
            )}
          </PopupForm>
        </Popup>
      </PopupTrigger>
    );
  };

  return (
    <Form values={parameters} onSubmit={handleSubmit}>
      <BaseParameters allowWebsiteSelect={!id} />
      {parametersSelected &&
        parameterGroups.map(({ id, label }) => {
          return (
            <FormRow key={label} label={label} action={<AddButton id={id} onAdd={handleAdd} />}>
              <ParameterList items={parameterData[id]} onRemove={index => handleRemove(id, index)}>
                {({ name, filter, value }) => {
                  return (
                    <div className={styles.parameter}>
                      {id === 'fields' && (
                        <>
                          <div>{fieldOptions.find(f => f.name === name)?.label}</div>
                        </>
                      )}
                      {id === 'filters' && (
                        <>
                          <div>{fieldOptions.find(f => f.name === name)?.label}</div>
                          <div className={styles.op}>{filterLabels[filter]}</div>
                          <div>{formatValue(value, name)}</div>
                        </>
                      )}
                    </div>
                  );
                }}
              </ParameterList>
            </FormRow>
          );
        })}
      <FormButtons>
        <SubmitButton variant="primary" disabled={!queryEnabled} isLoading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default InsightsParameters;
