import Share from './Share';

export default function ({ params: { id } }) {
  if (!id) {
    return null;
  }

  return <Share shareId={id} />;
}
