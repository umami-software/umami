import { useIntl, FormattedMessage, MessageDescriptor, PrimitiveType } from 'react-intl';
import { messages, labels } from 'components/messages';
import { FormatXMLElementFn, Options } from 'intl-messageformat';

export function useMessages(): any {
  const intl = useIntl();

  const getMessage = (id: string) => {
    const message = Object.values(messages).find(value => value.id === id);

    return message ? formatMessage(message) : id;
  };

  const formatMessage = (
    descriptor:
      | MessageDescriptor
      | {
          id: string;
          defaultMessage: string;
        },
    values?: Record<string, PrimitiveType | FormatXMLElementFn<string, string>>,
    opts?: Options,
  ) => {
    return descriptor ? intl.formatMessage(descriptor, values, opts) : null;
  };

  return { formatMessage, FormattedMessage, messages, labels, getMessage };
}

export default useMessages;
