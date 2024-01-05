import { Metadata } from 'next';
import Websites from './Websites';

export default function () {
  return <Websites />;
}

export const metadata: Metadata = {
  title: 'Websites Settings | umami',
};
