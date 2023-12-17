'use client';
import { useNavigation } from 'components/hooks';
import WebsiteDetails from './WebsiteDetails';

export default function WebsiteReportsPage({ params: { id } }) {
  const {
    query: { fields },
  } = useNavigation();
  return <WebsiteDetails customDataFields={fields?.split(',') ?? []} websiteId={id} />;
}
