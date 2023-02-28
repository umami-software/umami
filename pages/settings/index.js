export default () => null;

export async function getServerSideProps() {
  const destination = process.env.CLOUD_MODE ? 'https://cloud.umami.is' : '/settings/websites';

  return {
    redirect: {
      destination,
      permanent: true,
    },
  };
}
