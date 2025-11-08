import { Metadata } from 'next';
import { TeamsPage } from './TeamsPage';

export default function () {
  return <TeamsPage />;
}

export const metadata: Metadata = {
  title: 'Teams',
};
