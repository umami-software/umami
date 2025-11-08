import { DATA_TYPE, DATETIME_REGEX } from './constants';
import { DynamicDataType } from './types';

export function flattenJSON(
  eventData: Record<string, any>,
  keyValues: { key: string; value: any; dataType: DynamicDataType }[] = [],
  parentKey = '',
): { key: string; value: any; dataType: DynamicDataType }[] {
  return Object.keys(eventData).reduce(
    (acc, key) => {
      const value = eventData[key];
      const type = typeof eventData[key];

      // nested object
      if (value && type === 'object' && !Array.isArray(value) && !isValidDateValue(value)) {
        flattenJSON(value, acc.keyValues, getKeyName(key, parentKey));
      } else {
        createKey(getKeyName(key, parentKey), value, acc);
      }

      return acc;
    },
    { keyValues, parentKey },
  ).keyValues;
}

export function isValidDateValue(value: string) {
  return typeof value === 'string' && DATETIME_REGEX.test(value);
}

export function getDataType(value: any): string {
  let type: string = typeof value;

  if (isValidDateValue(value)) {
    type = 'date';
  }

  return type;
}

export function getStringValue(value: string, dataType: number) {
  if (dataType === DATA_TYPE.number) {
    return parseFloat(value).toFixed(4);
  }

  if (dataType === DATA_TYPE.date) {
    return new Date(value).toISOString();
  }

  return value;
}

function createKey(key: string, value: string, acc: { keyValues: any[]; parentKey: string }) {
  const type = getDataType(value);

  let dataType = null;

  switch (type) {
    case 'number':
      dataType = DATA_TYPE.number;
      break;
    case 'string':
      dataType = DATA_TYPE.string;
      break;
    case 'boolean':
      dataType = DATA_TYPE.boolean;
      value = value ? 'true' : 'false';
      break;
    case 'date':
      dataType = DATA_TYPE.date;
      break;
    case 'object':
      dataType = DATA_TYPE.array;
      value = JSON.stringify(value);
      break;
    default:
      dataType = DATA_TYPE.string;
      break;
  }

  acc.keyValues.push({ key, value, dataType });
}

function getKeyName(key: string, parentKey: string) {
  if (!parentKey) {
    return key;
  }

  return `${parentKey}.${key}`;
}

export function objectToArray(obj: object) {
  return Object.keys(obj).map(key => obj[key]);
}
