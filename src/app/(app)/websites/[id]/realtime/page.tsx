import Realtime from './Realtime';

export default function ({ params: { id } }) {
  if (!id) {
    return null;
  }

  return <Realtime websiteId={id} />;
}
