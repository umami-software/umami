import { getRequestConfig } from 'next-intl/server';
import enUS from '../../public/intl/messages/en-US.json';

export default getRequestConfig(async () => {
  return {
    locale: 'en-US',
    messages: enUS,
  };
});
