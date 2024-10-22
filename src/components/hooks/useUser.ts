import useStore, { setUser } from 'store/app';

const selector = state => state.user;

export function useUser() {
  const user = useStore(selector);

  return { user, setUser };
}

export default useUser;
