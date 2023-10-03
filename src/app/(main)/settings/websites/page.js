import Websites from './Websites';

export default function () {
  if (process.env.cloudMode) {
    return null;
  }

  return <Websites />;
}
