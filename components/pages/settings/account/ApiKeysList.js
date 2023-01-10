import { Text, Icon, useToast, Banner, LoadingButton, Loading } from 'react-basics';
import useApi from 'hooks/useApi';
import ApiKeysTable from 'components/pages/settings/account/ApiKeysTable';

export default function ApiKeysList() {
  const { toast, showToast } = useToast();
  const { get, post, useQuery, useMutation } = useApi();
  const { mutate, isLoading: isUpdating } = useMutation(data => post('/api-key', data));
  const { data, refetch, isLoading, error } = useQuery(['api-key'], () => get(`/api-key`));
  const hasData = data && data.length !== 0;

  const handleCreate = () => {
    mutate(
      {},
      {
        onSuccess: async () => {
          showToast({ message: 'API key saved.', variant: 'success' });
          await handleSave();
        },
      },
    );
  };

  const handleSave = async () => {
    await refetch();
  };

  if (error) {
    return <Banner variant="error">Something went wrong.</Banner>;
  }

  if (isLoading) {
    return <Loading icon="dots" position="block" />;
  }

  return (
    <>
      {toast}
      <LoadingButton loading={isUpdating} onClick={handleCreate}>
        <Icon icon="plus" /> Create key
      </LoadingButton>
      {hasData && <ApiKeysTable data={data} onSave={handleSave} />}
      {!hasData && <Text>You don&apos;t have any API keys.</Text>}
    </>
  );
}
