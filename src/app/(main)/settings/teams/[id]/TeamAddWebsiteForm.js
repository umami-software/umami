import useApi from 'components/hooks/useApi';
import { useState } from 'react';
import { Button, Form, FormButtons, GridColumn, Loading, SubmitButton, Toggle } from 'react-basics';
import useMessages from 'components/hooks/useMessages';
import WebsitesDataTable from '../../websites/WebsitesDataTable';

export function TeamAddWebsiteForm({ teamId, onSave, onClose }) {
  const { formatMessage, labels } = useMessages();
  const { get, post, useQuery, useMutation } = useApi();
  const { mutate, error } = useMutation(data => post(`/teams/${teamId}/websites`, data));
  const { data: websites } = useQuery(['websites'], () => get('/websites'));
  const [selected, setSelected] = useState([]);
  const hasData = websites && websites.data.length > 0;

  const handleSubmit = () => {
    mutate(
      { websiteIds: selected },
      {
        onSuccess: async () => {
          onSave();
          onClose();
        },
      },
    );
  };

  const handleSelect = id => {
    setSelected(state => (state.includes(id) ? state.filter(n => n !== id) : state.concat(id)));
  };

  return (
    <>
      {!hasData && <Loading />}
      {hasData && (
        <Form onSubmit={handleSubmit} error={error}>
          <WebsitesDataTable showHeader={false} showActions={false}>
            <GridColumn name="select" label={formatMessage(labels.selectWebsite)} alignment="end">
              {row => (
                <Toggle
                  key={row.id}
                  value={row.id}
                  checked={selected?.includes(row.id)}
                  onChange={handleSelect.bind(null, row.id)}
                />
              )}
            </GridColumn>
          </WebsitesDataTable>
          <FormButtons flex>
            <SubmitButton disabled={selected?.length === 0}>
              {formatMessage(labels.addWebsite)}
            </SubmitButton>
            <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
          </FormButtons>
        </Form>
      )}
    </>
  );
}

export default TeamAddWebsiteForm;
