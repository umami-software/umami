import Share from './Share';

export default function ({ params: { id } }) {
  return <Share shareId={id[0]} />;
}
