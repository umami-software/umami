export default () => null;

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/settings/websites',
      permanent: true,
    },
  };
}
