import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import DateFilter from 'components/input/DateFilter';
import DataTable from 'components/metrics/DataTable';
import FilterTags from 'components/metrics/FilterTags';
import useApi from 'hooks/useApi';
import useDateRange from 'hooks/useDateRange';
import useTimezone from 'hooks/useTimezone';
import { useEffect, useState, useRef } from 'react';
import {
  Button,
  Dropdown,
  Flexbox,
  Form,
  FormButtons,
  FormInput,
  FormRow,
  Item,
  TextField,
} from 'react-basics';
import { FormattedMessage } from 'react-intl';
import { FormMessage } from '../layout/FormLayout';
import styles from './EventDataForm.module.css';

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
  const { mutate } = useMutation(data => post(`/websites/${websiteId}/eventdata`, data));
  const [columns, setColumns] = useState({});
  const [filters, setFilters] = useState({});
  const [type, setType] = useState('');
  const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useDateRange('report');
  const { startDate, endDate, value } = dateRange;
  const [timezone] = useTimezone();
  const [isValid, setIsValid] = useState(false);
  const columnRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    if (Object.keys(columns).length > 0) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [columns]);

  const handleAddTag = (value, list, setState, ref, clearDropdown) => {
    setState({ ...list, [`${value.field}`]: value.value });

    ref.current.reset({ field: '', value: '' });

    if (clearDropdown) {
      setType('');
    }
  };

  const handleRemoveTag = (value, list, setState) => {
    const newList = { ...list };

    delete newList[`${value}`];

    setState(newList);
  };

  const handleSubmit = async () => {
    const params = {
      website_id: websiteId,
      startAt: +startDate,
      endAt: +endDate,
      timezone,
      columns,
      filters,
    };

    mutate(params, {
      onSuccess: async data => {
        setData(data);
        setMessage(null);
      },
      onError: async () => {
        setMessage(
          <FormattedMessage id="message.failure" defaultMessage="Something went wrong." />,
        );
        setData([]);
      },
    });
  };

  return (
    <>
      <Flexbox className={styles.message} alignItems="center" direction="column">
        <FormMessage>{message}</FormMessage>
      </Flexbox>
      <div className={classNames(styles.container, className)}>
        <div className={styles.form}>
          <div className={styles.filters}>
            <FormRow label={<FormattedMessage id="label.date-range" defaultMessage="Date Range" />}>
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
            <Form
              ref={columnRef}
              onSubmit={value =>
                handleAddTag({ ...value, value: type }, columns, setColumns, columnRef, true)
              }
            >
              <FormRow
                label={<FormattedMessage id="label.field-name" defaultMessage="Field Name" />}
              >
                <FormInput name="field" rules={{ required: 'Required' }}>
                  <TextField />
                </FormInput>
              </FormRow>
              <FormRow label={<FormattedMessage id="label.type" defaultMessage="Type" />}>
                <FormInput name="value">
                  <Dropdown items={filterOptions} value={type} onChange={setType}>
                    {({ value, label }) => <Item key={value}>{label}</Item>}
                  </Dropdown>
                </FormInput>
              </FormRow>
              <FormButtons className={styles.formButtons}>
                <Button variant="action" type="submit">
                  <FormattedMessage id="label.add-column" defaultMessage="Add Column" />
                </Button>
              </FormButtons>
            </Form>
            <FilterTags
              className={styles.filterTag}
              params={columns}
              onClick={value => handleRemoveTag(value, columns, setColumns)}
            />
          </div>
          <div className={styles.filters}>
            <Form
              ref={filterRef}
              onSubmit={value => handleAddTag(value, filters, setFilters, filterRef)}
            >
              <FormRow
                label={<FormattedMessage id="label.field-name" defaultMessage="Field Name" />}
              >
                <FormInput name="field">
                  <TextField />
                </FormInput>
              </FormRow>
              <FormRow label={<FormattedMessage id="label.value" defaultMessage="Value" />}>
                <FormInput name="value">
                  <TextField />
                </FormInput>
              </FormRow>
              <FormButtons className={styles.formButtons}>
                <Button variant="action" type="submit">
                  <FormattedMessage id="label.add-filter" defaultMessage="Add Filter" />
                </Button>
              </FormButtons>
            </Form>
            <FilterTags
              className={styles.filterTag}
              params={filters}
              onClick={value => handleRemoveTag(value, filters, setFilters)}
            />
          </div>
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
