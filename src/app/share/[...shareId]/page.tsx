import SharePage from './SharePage';

export default function ({ params: { shareId } }) {
  return <SharePage shareId={shareId[0]} />;
}
