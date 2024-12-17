import * as yup from 'yup';
import { isValidTimezone } from 'lib/date';
import { UNIT_TYPES } from './constants';

export const TimezoneTest = yup
  .string()
  .default('UTC')
  .test(
    'timezone',
    () => `Invalid timezone`,
    value => isValidTimezone(value),
  );

export const UnitTypeTest = yup.string().test(
  'unit',
  () => `Invalid unit`,
  value => UNIT_TYPES.includes(value),
);
