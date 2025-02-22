import SharePage from './SharePage';

export default async function ({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;

  return <SharePage shareId={shareId[0]} />;
}
