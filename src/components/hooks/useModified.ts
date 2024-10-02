import useStore from 'store/modified';

export function useModified(key?: string) {
  const modified = useStore(state => state?.[key]);

  const touch = (id?: string) => {
    if (id || key) {
      useStore.setState({ [id || key]: Date.now() });
    }
  };

  return { modified, touch };
}

export default useModified;
