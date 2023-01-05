import useStore, { setUser } from 'store/app';

const selector = state => state.user;

export default function useUser() {
  const user = useStore(selector);

  return { user, setUser };
}
