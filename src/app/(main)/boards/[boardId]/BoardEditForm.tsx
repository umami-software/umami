import { Form, FormField, TextField } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { useBoard, useMessages, useNavigation } from '@/components/hooks';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';

export function BoardEditForm() {
  const { board, updateBoard, saveBoard } = useBoard();
  const { t, labels } = useMessages();
  const { teamId } = useNavigation();

  const handleNameChange = (name: string) => {
    updateBoard({ name });
  };

  const handleDescriptionChange = (description: string) => {
    updateBoard({ description });
  };

  const handleWebsiteChange = (websiteId: string) => {
    updateBoard({
      parameters: {
        ...board.parameters,
        websiteId,
      },
    });
  };

  return (
    <Panel title={t(labels.details)} marginBottom="6">
      <Form
        onSubmit={saveBoard}
        values={{
          name: board?.name ?? '',
          description: board?.description ?? '',
          websiteId: board?.parameters?.websiteId ?? '',
        }}
      >
        <FormField name="name" label={t(labels.name)} rules={{ required: t(labels.required) }}>
          <TextField
            autoComplete="off"
            autoFocus={!board?.id}
            value={board?.name ?? ''}
            placeholder={t(labels.untitled)}
            onChange={handleNameChange}
          />
        </FormField>
        <FormField name="description" label={t(labels.description)}>
          <TextField
            autoComplete="off"
            asTextArea
            resize="vertical"
            value={board?.description ?? ''}
            placeholder={t(labels.addDescription)}
            onChange={handleDescriptionChange}
          />
        </FormField>
        <FormField name="websiteId" label={t(labels.website)}>
          <WebsiteSelect
            websiteId={board?.parameters?.websiteId}
            teamId={teamId}
            onChange={handleWebsiteChange}
          />
        </FormField>
      </Form>
    </Panel>
  );
}
