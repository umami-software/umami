import Index from './index';

export default Index;

export async function getServerSideProps() {
  return {
    props: {
      pageDisabled: !!process.env.DISABLE_UI,
    },
  };
}
