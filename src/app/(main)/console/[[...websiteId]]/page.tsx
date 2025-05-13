import { Metadata } from 'next';
import TestConsole from '../TestConsole';

async function getEnabled() {
  return !!process.env.ENABLE_TEST_CONSOLE;
}

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  const enabled = await getEnabled();

  if (!enabled) {
    return null;
  }

  return <TestConsole websiteId={websiteId?.[0]} />;
}

export const metadata: Metadata = {
  title: 'Test Console',
};
