export default () => null;

export async function getServerSideProps() {
  const dest = process.env.CLOUD_MODE ? 'profile' : 'websites';

  return {
    redirect: {
      destination: `/settings/${dest}`,
      permanent: true,
    },
  };
}
