import SharePage from './SharePage';

export default async function ({ params }: { params: { shareId: string } }) {
  const { shareId } = await params;

  return <SharePage shareId={shareId[0]} />;
}
