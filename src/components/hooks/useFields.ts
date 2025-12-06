import { useMessages } from './useMessages';

export function useFields() {
  const { formatMessage, labels } = useMessages();

  const fields = [
    { name: 'path', type: 'string', label: formatMessage(labels.path) },
    { name: 'query', type: 'string', label: formatMessage(labels.query) },
    { name: 'title', type: 'string', label: formatMessage(labels.pageTitle) },
    { name: 'referrer', type: 'string', label: formatMessage(labels.referrer) },
    { name: 'browser', type: 'string', label: formatMessage(labels.browser) },
    { name: 'os', type: 'string', label: formatMessage(labels.os) },
    { name: 'device', type: 'string', label: formatMessage(labels.device) },
    { name: 'country', type: 'string', label: formatMessage(labels.country) },
    { name: 'region', type: 'string', label: formatMessage(labels.region) },
    { name: 'city', type: 'string', label: formatMessage(labels.city) },
    { name: 'hostname', type: 'string', label: formatMessage(labels.hostname) },
    { name: 'tag', type: 'string', label: formatMessage(labels.tag) },
    { name: 'event', type: 'string', label: formatMessage(labels.event) },
  ];

  return { fields };
}
