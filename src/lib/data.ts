import { DATA_TYPE, DATETIME_REGEX } from './constants';
import type { DynamicDataType } from './types';

export interface KeyValueData {
  key: string;
  value: any;
  dataType: DynamicDataType;
}

export function flattenJSON(eventData: Record<string, any>): KeyValueData[] {
  function flatten(obj: Record<string, any>, parentKey: string): KeyValueData[] {
    return Object.entries(obj).flatMap(([key, value]) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value) && !isValidDateValue(value)) {
        return flatten(value, fullKey);
      }

      return [createKeyValue(fullKey, value)];
    });
  }

  return flatten(eventData, '');
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

export function createKeyValue(key: string, value: any): KeyValueData {
  const type = getDataType(value);
  let dataType: DynamicDataType;
  let processedValue = value;

  switch (type) {
    case 'number':
      dataType = DATA_TYPE.number;
      break;
    case 'string':
      dataType = DATA_TYPE.string;
      break;
    case 'boolean':
      dataType = DATA_TYPE.boolean;
      processedValue = value ? 'true' : 'false';
      break;
    case 'date':
      dataType = DATA_TYPE.date;
      break;
    case 'object':
      dataType = DATA_TYPE.array;
      processedValue = JSON.stringify(value);
      break;
    default:
      dataType = DATA_TYPE.string;
      break;
  }

  return { key, value: processedValue, dataType };
}

export function objectToArray(obj: object) {
  return Object.keys(obj).map(key => obj[key]);
}
