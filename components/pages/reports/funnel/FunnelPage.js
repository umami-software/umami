import { useMutation } from '@tanstack/react-query';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import ReportsLayout from 'components/layout/ReportsLayout';
import useApi from 'hooks/useApi';
import { useState } from 'react';
import FunnelChart from './FunnelChart';
import FunnelTable from './FunnelTable';
import FunnelForm from './FunnelForm';

export default function FunnelPage() {
  const { post } = useApi();
  const { mutate } = useMutation(data => post('/reports/funnel', data));
  const [data, setData] = useState([{}]);
  const [setFormData] = useState();

  function handleOnSearch(data) {
    setFormData(data);

    mutate(data, {
      onSuccess: async data => {
        setData(data);
      },
    });
  }

  return (
    <ReportsLayout filter={<FunnelForm onSearch={handleOnSearch} />} header={'test'}>
      <Page>
        <PageHeader title="Funnel Report"></PageHeader>
        <FunnelChart data={data} />
        <FunnelTable data={data} />
      </Page>
    </ReportsLayout>
  );
}
