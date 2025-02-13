import { Metadata } from 'next';
import App from './App';

export default async function ({ children }) {
  return <App>{children}</App>;
}

export const metadata: Metadata = {
  title: {
    template: '%s | Umami',
    default: 'Umami',
  },
};
