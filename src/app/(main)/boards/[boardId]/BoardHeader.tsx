import { Button, Column, Grid, InlineEditField, Row } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';

export function BoardHeader() {
  const { formatMessage, labels } = useMessages();
  const defaultName = formatMessage(labels.untitled);
  const name = 'My Board';
  const description = 'This is my board';

  const handleNameChange = (name: string) => {
    //updateReport({ name: name || defaultName });
  };

  const handleDescriptionChange = (description: string) => {
    //updateReport({ description });
  };

  return (
    <Grid columns="1fr 1fr">
      <Column>
        <Row>
          <InlineEditField
            name="name"
            value={name}
            placeholder={defaultName}
            onCommit={handleNameChange}
          />
        </Row>
        <Row>
          <InlineEditField
            name="description"
            value={description}
            placeholder={`+ ${formatMessage(labels.addDescription)}`}
            onCommit={handleDescriptionChange}
          />
        </Row>
      </Column>
      <Row justifyContent="flex-end">
        <Button variant="primary">{formatMessage(labels.save)}</Button>
      </Row>
    </Grid>
  );
}
