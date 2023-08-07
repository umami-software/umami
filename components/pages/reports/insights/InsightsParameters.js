import { useContext, useRef } from 'react';
import { useMessages } from 'hooks';
import { Form, FormRow, FormButtons, SubmitButton, PopupTrigger, Icon, Popup } from 'react-basics';
import { ReportContext } from 'components/pages/reports/Report';
import { REPORT_PARAMETERS } from 'lib/constants';
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
  const { websiteId, dateRange, filters, groups } = parameters || {};
  const queryEnabled = websiteId && dateRange && (filters?.length || groups?.length);

  const fieldOptions = [
    { name: 'url_path', type: 'string', label: formatMessage(labels.url) },
    { name: 'page_title', type: 'string', label: formatMessage(labels.pageTitle) },
    { name: 'referrer_domain', type: 'string', label: formatMessage(labels.referrer) },
    { name: 'url_query', type: 'string', label: formatMessage(labels.query) },
    { name: 'browser', type: 'string', label: formatMessage(labels.browser) },
    { name: 'os', type: 'string', label: formatMessage(labels.os) },
    { name: 'device', type: 'string', label: formatMessage(labels.device) },
    { name: 'country', type: 'string', label: formatMessage(labels.country) },
    { name: 'region', type: 'string', label: formatMessage(labels.region) },
    { name: 'city', type: 'string', label: formatMessage(labels.city) },
    { name: 'language', type: 'string', label: formatMessage(labels.language) },
  ];

  const parameterGroups = [
    { label: formatMessage(labels.breakdown), group: REPORT_PARAMETERS.groups },
    { label: formatMessage(labels.filters), group: REPORT_PARAMETERS.filters },
  ];

  const parameterData = {
    filters,
    groups,
  };

  const handleSubmit = values => {
    runReport(values);
  };

  const handleAdd = (group, value) => {
    const data = parameterData[group];

    if (!data.find(({ name }) => name === value.name)) {
      updateReport({ parameters: { [group]: data.concat(value) } });
    }
  };

  const handleRemove = (group, index) => {
    const data = [...parameterData[group]];
    data.splice(index, 1);
    updateReport({ parameters: { [group]: data } });
  };

  const AddButton = ({ group }) => {
    return (
      <PopupTrigger>
        <Icon>
          <Icons.Plus />
        </Icon>
        <Popup position="bottom" alignment="start">
          {(close, element) => {
            return (
              <PopupForm element={element} onClose={close}>
                {group === REPORT_PARAMETERS.groups && (
                  <FieldSelectForm fields={fieldOptions} onSelect={handleAdd.bind(null, group)} />
                )}
                {group === REPORT_PARAMETERS.filters && (
                  <FilterSelectForm fields={fieldOptions} onSelect={handleAdd.bind(null, group)} />
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
      {parameterGroups.map(({ label, group }) => {
        return (
          <FormRow key={label} label={label} action={<AddButton group={group} onAdd={handleAdd} />}>
            <ParameterList
              items={parameterData[group]}
              onRemove={index => handleRemove(group, index)}
            >
              {({ value, label }) => {
                return (
                  <div className={styles.parameter}>
                    {group === REPORT_PARAMETERS.groups && (
                      <>
                        <div>{label}</div>
                      </>
                    )}
                    {group === REPORT_PARAMETERS.filters && (
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
