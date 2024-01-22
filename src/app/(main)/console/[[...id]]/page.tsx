import TestConsole from '../TestConsole';
import { Metadata } from 'next';

async function getEnabled() {
  return !!process.env.ENABLE_TEST_CONSOLE;
}

export default async function ({ params: { id } }) {
  const enabled = await getEnabled();

  if (!enabled) {
    return null;
  }

  return <TestConsole websiteId={id?.[0]} />;
}

export const metadata: Metadata = {
  title: 'Test Console | umami',
};
