import { Metadata } from 'next';
import Websites from './Websites';

export default function ({ params: { teamId } }: { params: { teamId: string } }) {
  return <Websites teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Websites Settings | Umami',
};
