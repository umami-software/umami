import moment from 'moment';
import * as yup from 'yup';
import { UNIT_TYPES } from './constants';

export const TimezoneTest = yup
  .string()
  .default('UTC')
  .test(
    'timezone',
    () => `Invalid timezone`,
    value => moment.tz.zone(value) !== null,
  );

export const UnitTypeTest = yup.string().test(
  'unit',
  () => `Invalid unit`,
  value => UNIT_TYPES.includes(value),
);
