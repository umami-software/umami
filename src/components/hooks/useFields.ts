import { useMessages } from './useMessages';

export type FieldGroup = 'url' | 'sources' | 'location' | 'environment' | 'utm' | 'other';

export interface Field {
  name: string;
  filterLabel: string;
  label: string;
  group: FieldGroup;
}

export function useFields() {
  const { formatMessage, labels } = useMessages();

  const fields: Field[] = [
    {
      name: 'path',
      filterLabel: formatMessage(labels.path),
      label: formatMessage(labels.path),
      group: 'url',
    },
    {
      name: 'query',
      filterLabel: formatMessage(labels.query),
      label: formatMessage(labels.query),
      group: 'url',
    },
    {
      name: 'title',
      filterLabel: formatMessage(labels.pageTitle),
      label: formatMessage(labels.pageTitle),
      group: 'url',
    },
    {
      name: 'referrer',
      filterLabel: formatMessage(labels.referrer),
      label: formatMessage(labels.referrer),
      group: 'sources',
    },
    {
      name: 'country',
      filterLabel: formatMessage(labels.country),
      label: formatMessage(labels.country),
      group: 'location',
    },
    {
      name: 'region',
      filterLabel: formatMessage(labels.region),
      label: formatMessage(labels.region),
      group: 'location',
    },
    {
      name: 'city',
      filterLabel: formatMessage(labels.city),
      label: formatMessage(labels.city),
      group: 'location',
    },
    {
      name: 'browser',
      filterLabel: formatMessage(labels.browser),
      label: formatMessage(labels.browser),
      group: 'environment',
    },
    {
      name: 'os',
      filterLabel: formatMessage(labels.os),
      label: formatMessage(labels.os),
      group: 'environment',
    },
    {
      name: 'device',
      filterLabel: formatMessage(labels.device),
      label: formatMessage(labels.device),
      group: 'environment',
    },
    {
      name: 'utmSource',
      filterLabel: formatMessage(labels.source),
      label: formatMessage(labels.utmSource),
      group: 'utm',
    },
    {
      name: 'utmMedium',
      filterLabel: formatMessage(labels.medium),
      label: formatMessage(labels.utmMedium),
      group: 'utm',
    },
    {
      name: 'utmCampaign',
      filterLabel: formatMessage(labels.campaign),
      label: formatMessage(labels.utmCampaign),
      group: 'utm',
    },
    {
      name: 'utmContent',
      filterLabel: formatMessage(labels.content),
      label: formatMessage(labels.utmContent),
      group: 'utm',
    },
    {
      name: 'utmTerm',
      filterLabel: formatMessage(labels.term),
      label: formatMessage(labels.utmTerm),
      group: 'utm',
    },
    {
      name: 'hostname',
      filterLabel: formatMessage(labels.hostname),
      label: formatMessage(labels.hostname),
      group: 'other',
    },
    {
      name: 'distinctId',
      filterLabel: formatMessage(labels.distinctId),
      label: formatMessage(labels.distinctId),
      group: 'other',
    },
    {
      name: 'tag',
      filterLabel: formatMessage(labels.tag),
      label: formatMessage(labels.tag),
      group: 'other',
    },
    {
      name: 'event',
      filterLabel: formatMessage(labels.event),
      label: formatMessage(labels.event),
      group: 'other',
    },
  ];

  const groupLabels: { key: FieldGroup; label: string }[] = [
    { key: 'url', label: formatMessage(labels.url) },
    { key: 'sources', label: formatMessage(labels.sources) },
    { key: 'location', label: formatMessage(labels.location) },
    { key: 'environment', label: formatMessage(labels.environment) },
    { key: 'utm', label: formatMessage(labels.utm) },
    { key: 'other', label: formatMessage(labels.other) },
  ];

  return { fields, groupLabels };
}
