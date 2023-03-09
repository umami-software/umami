import { labels } from 'components/messages';
import useApi from 'hooks/useApi';
import { useRef, useState } from 'react';
import { Button, Dropdown, Form, FormButtons, FormRow, Item, SubmitButton } from 'react-basics';
import { useIntl } from 'react-intl';
import WebsiteTags from './WebsiteTags';

export default function WebsiteAddTeamForm({ teamId, onSave, onClose }) {
  const { formatMessage } = useIntl();
  const { get, post, useQuery, useMutation } = useApi();
  const { mutate, error } = useMutation(data => post(`/teams/${teamId}/websites`, data));
  const { data: websites } = useQuery(['websites'], () => get('/websites'));
  const [newWebsites, setNewWebsites] = useState([]);
  const formRef = useRef();

  const handleSubmit = () => {
    mutate(
      { websiteIds: newWebsites },
      {
        onSuccess: async () => {
          onSave();
          onClose();
        },
      },
    );
  };

  const handleAddWebsite = value => {
    if (!newWebsites.some(a => a === value)) {
      const nextValue = [...newWebsites];

      nextValue.push(value);

      setNewWebsites(nextValue);
    }
  };

  const handleRemoveWebsite = value => {
    const newValue = newWebsites.filter(a => a !== value);

    setNewWebsites(newValue);
  };

  return (
    <>
      <Form onSubmit={handleSubmit} error={error} ref={formRef}>
        <FormRow label={formatMessage(labels.websites)}>
          <Dropdown items={websites} onChange={handleAddWebsite}>
            {({ id, name }) => <Item key={id}>{name}</Item>}
          </Dropdown>
        </FormRow>
        <WebsiteTags items={websites} websites={newWebsites} onClick={handleRemoveWebsite} />
        <FormButtons flex>
          <SubmitButton disabled={newWebsites && newWebsites.length === 0}>
            {formatMessage(labels.addWebsites)}
          </SubmitButton>
          <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
        </FormButtons>
      </Form>
    </>
  );
}
