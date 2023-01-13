import classNames from 'classnames';
import Button from 'components/common/Button';
import DateFilter from 'components/common/DateFilter';
import DropDown from 'components/common/DropDown';
import FormLayout, {
  FormButtons,
  FormError,
  FormMessage,
  FormRow,
} from 'components/layout/FormLayout';
import DataTable from 'components/metrics/DataTable';
import FilterTags from 'components/metrics/FilterTags';
import { Field, Form, Formik } from 'formik';
import useApi from 'hooks/useApi';
import useDateRange from 'hooks/useDateRange';
import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import styles from './EventDataForm.module.css';
import useTimezone from 'hooks/useTimezone';

export const filterOptions = [
  { label: 'Count', value: 'count' },
  { label: 'Average', value: 'avg' },
  { label: 'Minimum', value: 'min' },
  { label: 'Maximum', value: 'max' },
  { label: 'Sum', value: 'sum' },
];

export const dateOptions = [
  { label: <FormattedMessage id="label.today" defaultMessage="Today" />, value: '1day' },
  {
    label: (
      <FormattedMessage id="label.last-hours" defaultMessage="Last {x} hours" values={{ x: 24 }} />
    ),
    value: '24hour',
  },
  {
    label: <FormattedMessage id="label.yesterday" defaultMessage="Yesterday" />,
    value: '-1day',
  },
  {
    label: <FormattedMessage id="label.this-week" defaultMessage="This week" />,
    value: '1week',
    divider: true,
  },
  {
    label: (
      <FormattedMessage id="label.last-days" defaultMessage="Last {x} days" values={{ x: 7 }} />
    ),
    value: '7day',
  },
  {
    label: <FormattedMessage id="label.this-month" defaultMessage="This month" />,
    value: '1month',
    divider: true,
  },
  {
    label: (
      <FormattedMessage id="label.last-days" defaultMessage="Last {x} days" values={{ x: 30 }} />
    ),
    value: '30day',
  },
  {
    label: (
      <FormattedMessage id="label.last-days" defaultMessage="Last {x} days" values={{ x: 90 }} />
    ),
    value: '90day',
  },
  { label: <FormattedMessage id="label.this-year" defaultMessage="This year" />, value: '1year' },
  {
    label: <FormattedMessage id="label.custom-range" defaultMessage="Custom range" />,
    value: 'custom',
    divider: true,
  },
];

export default function EventDataForm({ websiteId, onClose, className }) {
  const { post } = useApi();
  const [message, setMessage] = useState();
  const [columns, setColumns] = useState({});
  const [filters, setFilters] = useState({});
  const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useDateRange('report');
  const { startDate, endDate, value } = dateRange;
  const [timezone] = useTimezone();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (Object.keys(columns).length > 0) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [columns]);

  const handleAddTag = (value, list, setState, resetForm) => {
    setState({ ...list, [`${value.field}`]: value.value });
    resetForm();
  };

  const handleRemoveTag = (value, list, setState) => {
    const newList = { ...list };

    delete newList[`${value}`];

    setState(newList);
  };

  const handleSubmit = async () => {
    const params = {
      website_id: websiteId,
      start_at: +startDate,
      end_at: +endDate,
      timezone,
      columns,
      filters,
    };

    const { ok, data } = await post(`/websites/${websiteId}/eventdata`, params);

    if (!ok) {
      setMessage(<FormattedMessage id="message.failure" defaultMessage="Something went wrong." />);
      setData([]);
    } else {
      setData(data);
      setMessage(null);
    }
  };

  return (
    <>
      <FormMessage>{message}</FormMessage>
      <div className={classNames(styles.container, className)}>
        <div className={styles.form}>
          <FormLayout>
            <div className={styles.filters}>
              <FormRow>
                <label htmlFor="date-range">
                  <FormattedMessage id="label.date-range" defaultMessage="Date Range" />
                </label>
                <DateFilter
                  value={value}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={setDateRange}
                  options={dateOptions}
                />
              </FormRow>
            </div>
            <div className={styles.filters}>
              <Formik
                initialValues={{ field: '', value: '' }}
                onSubmit={(value, { resetForm }) =>
                  handleAddTag(value, columns, setColumns, resetForm)
                }
              >
                {({ values, setFieldValue }) => (
                  <Form>
                    <FormRow>
                      <label htmlFor="field">
                        <FormattedMessage id="label.field-name" defaultMessage="Field Name" />
                      </label>
                      <div>
                        <Field name="field" type="text" />
                        <FormError name="field" />
                      </div>
                    </FormRow>
                    <FormRow>
                      <label htmlFor="value">
                        <FormattedMessage id="label.type" defaultMessage="Type" />
                      </label>
                      <div>
                        <DropDown
                          value={values.value}
                          onChange={value => setFieldValue('value', value)}
                          className={styles.dropdown}
                          name="value"
                          options={filterOptions}
                        />
                        <FormError name="value" />
                      </div>
                    </FormRow>
                    <FormButtons className={styles.formButtons}>
                      <Button
                        variant="action"
                        type="submit"
                        disabled={!values.field || !values.value}
                      >
                        <FormattedMessage id="label.add-column" defaultMessage="Add Column" />
                      </Button>
                    </FormButtons>
                  </Form>
                )}
              </Formik>
              <FilterTags
                className={styles.filterTag}
                params={columns}
                onClick={value => handleRemoveTag(value, columns, setColumns)}
              />
            </div>
            <div className={styles.filters}>
              <Formik
                initialValues={{ field: '', value: '' }}
                onSubmit={(value, { resetForm }) =>
                  handleAddTag(value, filters, setFilters, resetForm)
                }
              >
                {({ values }) => (
                  <Form>
                    <FormRow>
                      <label htmlFor="field">
                        <FormattedMessage id="label.field-name" defaultMessage="Field Name" />
                      </label>
                      <div>
                        <Field name="field" type="text" />
                        <FormError name="field" />
                      </div>
                    </FormRow>
                    <FormRow>
                      <label htmlFor="value">
                        <FormattedMessage id="label.value" defaultMessage="Value" />
                      </label>
                      <div>
                        <Field name="value" type="text" />
                        <FormError name="value" />
                      </div>
                    </FormRow>
                    <FormButtons className={styles.formButtons}>
                      <Button
                        variant="action"
                        type="submit"
                        disabled={!values.field || !values.value}
                      >
                        <FormattedMessage id="label.add-filter" defaultMessage="Add Filter" />
                      </Button>
                    </FormButtons>
                  </Form>
                )}
              </Formik>
              <FilterTags
                className={styles.filterTag}
                params={filters}
                onClick={value => handleRemoveTag(value, filters, setFilters)}
              />
            </div>
          </FormLayout>
        </div>
        <div>
          <DataTable className={styles.table} data={data} title="Results" showPercentage={false} />
        </div>
      </div>
      <FormButtons>
        <Button variant="action" onClick={handleSubmit} disabled={!isValid}>
          <FormattedMessage id="label.search" defaultMessage="Search" />
        </Button>
        <Button onClick={onClose}>
          <FormattedMessage id="label.cancel" defaultMessage="Cancel" />
        </Button>
      </FormButtons>
    </>
  );
}
