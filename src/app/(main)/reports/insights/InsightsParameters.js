import { useContext, useRef } from 'react';
import { useFormat, useMessages, useFilters } from 'components/hooks';
import {
  Form,
  FormRow,
  FormButtons,
  SubmitButton,
  PopupTrigger,
  Icon,
  Popup,
  TooltipPopup,
} from 'react-basics';
import Icons from 'components/icons';
import BaseParameters from '../[id]/BaseParameters';
import { ReportContext } from '../[id]/Report';
import ParameterList from '../[id]/ParameterList';
import FilterSelectForm from '../[id]/FilterSelectForm';
import FieldSelectForm from '../[id]/FieldSelectForm';
import PopupForm from '../[id]/PopupForm';
import styles from './InsightsParameters.module.css';

export function InsightsParameters() {
  const { report, runReport, updateReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const { filterLabels } = useFilters();
  const ref = useRef(null);
  const { parameters } = report || {};
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

  const AddButton = ({ id }) => {
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
                items={fieldOptions}
                onSelect={handleAdd.bind(null, id)}
                showType={false}
              />
            )}
            {id === 'filters' && (
              <FilterSelectForm
                websiteId={websiteId}
                items={fieldOptions}
                onSelect={handleAdd.bind(null, id)}
              />
            )}
          </PopupForm>
        </Popup>
      </PopupTrigger>
    );
  };

  return (
    <Form ref={ref} values={parameters} onSubmit={handleSubmit}>
      <BaseParameters />
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
