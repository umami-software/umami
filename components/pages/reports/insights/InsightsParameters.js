import { useContext, useRef } from 'react';
import { useMessages } from 'hooks';
import { Form, FormRow, FormButtons, SubmitButton, PopupTrigger, Icon, Popup } from 'react-basics';
import { ReportContext } from 'components/pages/reports/Report';
import Icons from 'components/icons';
import BaseParameters from '../BaseParameters';
import ParameterList from '../ParameterList';
import styles from './InsightsParameters.module.css';
import PopupForm from '../PopupForm';
import FilterSelectForm from '../FilterSelectForm';
import FieldSelectForm from '../FieldSelectForm';

export function InsightsParameters() {
  const { report, runReport, updateReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const ref = useRef(null);
  const { parameters } = report || {};
  const { websiteId, dateRange, fields, filters } = parameters || {};
  const queryEnabled = websiteId && dateRange && (fields?.length || filters?.length);

  const fieldOptions = [
    { name: 'url_path', label: formatMessage(labels.url) },
    { name: 'page_title', label: formatMessage(labels.pageTitle) },
    { name: 'referrer_domain', label: formatMessage(labels.referrer) },
    { name: 'url_query', label: formatMessage(labels.query) },
    { name: 'browser', label: formatMessage(labels.browser) },
    { name: 'os', label: formatMessage(labels.os) },
    { name: 'device', label: formatMessage(labels.device) },
    { name: 'country', label: formatMessage(labels.country) },
    { name: 'region', label: formatMessage(labels.region) },
    { name: 'city', label: formatMessage(labels.city) },
    { name: 'language', label: formatMessage(labels.language) },
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
        <Icon>
          <Icons.Plus />
        </Icon>
        <Popup position="bottom" alignment="start">
          {(close, element) => {
            return (
              <PopupForm element={element} onClose={close}>
                {id === 'fields' && (
                  <FieldSelectForm items={fieldOptions} onSelect={handleAdd.bind(null, id)} />
                )}
                {id === 'filters' && (
                  <FilterSelectForm items={fieldOptions} onSelect={handleAdd.bind(null, id)} />
                )}
              </PopupForm>
            );
          }}
        </Popup>
      </PopupTrigger>
    );
  };

  return (
    <Form ref={ref} values={parameters} onSubmit={handleSubmit}>
      <BaseParameters />
      {parameterGroups.map(({ id, label }) => {
        return (
          <FormRow key={label} label={label} action={<AddButton id={id} onAdd={handleAdd} />}>
            <ParameterList items={parameterData[id]} onRemove={index => handleRemove(id, index)}>
              {({ value, label }) => {
                return (
                  <div className={styles.parameter}>
                    {id === 'fields' && (
                      <>
                        <div>{label}</div>
                      </>
                    )}
                    {id === 'filters' && (
                      <>
                        <div>{label}</div>
                        <div className={styles.op}>{value[0]}</div>
                        <div>{value[1]}</div>
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
        <SubmitButton variant="primary" disabled={!queryEnabled} loading={isRunning}>
          {formatMessage(labels.runQuery)}
        </SubmitButton>
      </FormButtons>
    </Form>
  );
}

export default InsightsParameters;
