import { useContext, useRef } from 'react';
import { useMessages } from 'hooks';
import { Form, FormRow, FormButtons, SubmitButton, PopupTrigger, Icon, Popup } from 'react-basics';
import { ReportContext } from 'components/pages/reports/Report';
import { REPORT_PARAMETERS, WEBSITE_EVENT_FIELDS } from 'lib/constants';
import Icons from 'components/icons';
import BaseParameters from '../BaseParameters';
import FieldAddForm from '../FieldAddForm';
import ParameterList from '../ParameterList';
import styles from './InsightsParameters.module.css';

export function InsightsParameters() {
  const { report, runReport, updateReport, isRunning } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();
  const ref = useRef(null);
  const { parameters } = report || {};
  const { websiteId, dateRange, fields, filters, groups } = parameters || {};
  const queryEnabled = websiteId && dateRange && fields?.length;
  const fieldOptions = Object.keys(WEBSITE_EVENT_FIELDS).map(key => WEBSITE_EVENT_FIELDS[key]);

  const parameterGroups = [
    { label: formatMessage(labels.fields), group: REPORT_PARAMETERS.fields },
    { label: formatMessage(labels.filters), group: REPORT_PARAMETERS.filters },
    { label: formatMessage(labels.breakdown), group: REPORT_PARAMETERS.groups },
  ];

  const parameterData = {
    fields,
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
              <FieldAddForm
                fields={fieldOptions}
                group={group}
                element={element}
                onAdd={handleAdd}
                onClose={close}
              />
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
              {({ name, value }) => {
                return (
                  <div className={styles.parameter}>
                    {group === REPORT_PARAMETERS.fields && (
                      <>
                        <div>{name}</div>
                        <div className={styles.op}>{value}</div>
                      </>
                    )}
                    {group === REPORT_PARAMETERS.filters && (
                      <>
                        <div>{name}</div>
                        <div className={styles.op}>{value[0]}</div>
                        <div>{value[1]}</div>
                      </>
                    )}
                    {group === REPORT_PARAMETERS.groups && (
                      <>
                        <div>{name}</div>
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
