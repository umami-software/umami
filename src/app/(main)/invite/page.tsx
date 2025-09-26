import { Metadata } from 'next';
import InvitePage from './InvitePage';

export const metadata: Metadata = {
  title: 'Join team',
};

export default function () {
  return <InvitePage />;
}
