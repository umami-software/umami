import { Metadata } from 'next';
import EventDataReport from './EventDataReport';

export default function () {
  return <EventDataReport />;
}

export const metadata: Metadata = {
  title: 'Event Data Report | Umami',
};
