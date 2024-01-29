import useStore, { setUser } from 'store/app';

const selector = (state: { user: any }) => state.user;

export function useUser() {
  const user = useStore(selector);

  return { user, setUser };
}

export default useUser;
