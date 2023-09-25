import moment from 'moment';
import * as yup from 'yup';

export const DateRangeValidation = {
  startAt: yup.number().integer().required(),
  endAt: yup.number().integer().moreThan(yup.ref('startAt')).required(),
};

// ex: /funnel|insights|retention/i
export function getFilterValidation(matchRegex) {
  return {
    filter: yup.string(),
    filterType: yup.string().matches(matchRegex),
    pageSize: yup.number().integer().positive().max(200),
    page: yup.number().integer().positive(),
    orderBy: yup.string(),
  };
}

export const TimezoneTest = yup.string().test(
  'timezone',
  () => `Invalid timezone`,
  value => !moment.tz.zone(value),
);
