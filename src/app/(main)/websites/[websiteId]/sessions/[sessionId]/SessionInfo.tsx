import Profile from 'components/common/Profile';

export default function SessionInfo({ data }) {
  return (
    <h1>
      <Profile seed={data?.id} />
      <dl>
        <dt>ID</dt>
        <dd>{data?.id}</dd>
        <dt>Country</dt>
        <dd>{data?.country}</dd>
        <dt>City</dt>
        <dd>{data?.city}</dd>
      </dl>
    </h1>
  );
}
