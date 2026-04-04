import { useMessages } from './useMessages';

export type FieldGroup = 'url' | 'sources' | 'location' | 'environment' | 'utm' | 'other';

export interface Field {
  name: string;
  filterLabel: string;
  label: string;
  group: FieldGroup;
}

export function useFields() {
  const { t, labels } = useMessages();

  const fields: Field[] = [
    {
      name: 'path',
      filterLabel: t(labels.path),
      label: t(labels.path),
      group: 'url',
    },
    {
      name: 'query',
      filterLabel: t(labels.query),
      label: t(labels.query),
      group: 'url',
    },
    {
      name: 'title',
      filterLabel: t(labels.pageTitle),
      label: t(labels.pageTitle),
      group: 'url',
    },
    {
      name: 'referrer',
      filterLabel: t(labels.referrer),
      label: t(labels.referrer),
      group: 'sources',
    },
    {
      name: 'country',
      filterLabel: t(labels.country),
      label: t(labels.country),
      group: 'location',
    },
    {
      name: 'region',
      filterLabel: t(labels.region),
      label: t(labels.region),
      group: 'location',
    },
    {
      name: 'city',
      filterLabel: t(labels.city),
      label: t(labels.city),
      group: 'location',
    },
    {
      name: 'browser',
      filterLabel: t(labels.browser),
      label: t(labels.browser),
      group: 'environment',
    },
    {
      name: 'os',
      filterLabel: t(labels.os),
      label: t(labels.os),
      group: 'environment',
    },
    {
      name: 'device',
      filterLabel: t(labels.device),
      label: t(labels.device),
      group: 'environment',
    },
    {
      name: 'utmSource',
      filterLabel: t(labels.source),
      label: t(labels.utmSource),
      group: 'utm',
    },
    {
      name: 'utmMedium',
      filterLabel: t(labels.medium),
      label: t(labels.utmMedium),
      group: 'utm',
    },
    {
      name: 'utmCampaign',
      filterLabel: t(labels.campaign),
      label: t(labels.utmCampaign),
      group: 'utm',
    },
    {
      name: 'utmContent',
      filterLabel: t(labels.content),
      label: t(labels.utmContent),
      group: 'utm',
    },
    {
      name: 'utmTerm',
      filterLabel: t(labels.term),
      label: t(labels.utmTerm),
      group: 'utm',
    },
    {
      name: 'hostname',
      filterLabel: t(labels.hostname),
      label: t(labels.hostname),
      group: 'other',
    },
    {
      name: 'distinctId',
      filterLabel: t(labels.distinctId),
      label: t(labels.distinctId),
      group: 'other',
    },
    {
      name: 'tag',
      filterLabel: t(labels.tag),
      label: t(labels.tag),
      group: 'other',
    },
    {
      name: 'event',
      filterLabel: t(labels.event),
      label: t(labels.event),
      group: 'other',
    },
  ];

  const groupLabels: { key: FieldGroup; label: string }[] = [
    { key: 'url', label: t(labels.url) },
    { key: 'sources', label: t(labels.sources) },
    { key: 'location', label: t(labels.location) },
    { key: 'environment', label: t(labels.environment) },
    { key: 'utm', label: t(labels.utm) },
    { key: 'other', label: t(labels.other) },
  ];

  return { fields, groupLabels };
}
