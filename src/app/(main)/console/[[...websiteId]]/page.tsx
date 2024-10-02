import { Metadata } from 'next';
import ConsolePage from '../ConsolePage';

async function getEnabled() {
  return !!process.env.ENABLE_TEST_CONSOLE;
}

export default async function ({ params: { websiteId } }) {
  const enabled = await getEnabled();

  if (!enabled) {
    return null;
  }

  return <ConsolePage websiteId={websiteId?.[0]} />;
}

export const metadata: Metadata = {
  title: 'Test Console',
};
