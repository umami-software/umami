export default () => null;

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/buttons/websites',
      permanent: true,
    },
  };
}
