import Index from './index';

export default Index;

export async function getServerSideProps() {
  return {
    props: {
      settingsDisabled: !!process.env.CLOUD_MODE,
    },
  };
}
