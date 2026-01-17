import { Column, Grid, Heading, LoadingButton, Row, TextField } from '@umami/react-zen';
import { useBoard, useMessages } from '@/components/hooks';

export function BoardHeader() {
  const { board, updateBoard, saveBoard, isPending } = useBoard();
  const { formatMessage, labels } = useMessages();
  const defaultName = formatMessage(labels.untitled);

  const handleNameChange = (value: string) => {
    updateBoard({ name: value });
  };

  const handleDescriptionChange = (value: string) => {
    updateBoard({ description: value });
  };

  const handleSave = () => {
    saveBoard();
  };

  return (
    <Grid
      columns={{ xs: '1fr', md: '1fr 1fr' }}
      paddingY="4"
      marginBottom="6"
      border="bottom"
      gapX="6"
    >
      <Column>
        <Row>
          <TextField
            variant="quiet"
            name="name"
            value={board?.name ?? ''}
            placeholder={defaultName}
            onChange={handleNameChange}
            autoComplete="off"
            style={{ fontSize: '2rem', fontWeight: 700, width: '100%' }}
          >
            <Heading size="4">{board?.name}</Heading>
          </TextField>
        </Row>
        <Row>
          <TextField
            variant="quiet"
            name="description"
            value={board?.description ?? ''}
            placeholder={`+ ${formatMessage(labels.addDescription)}`}
            autoComplete="off"
            onChange={handleDescriptionChange}
            style={{ width: '100%' }}
          >
            {board?.description}
          </TextField>
        </Row>
      </Column>
      <Column justifyContent="center" alignItems="flex-end">
        <LoadingButton variant="primary" onPress={handleSave} isLoading={isPending}>
          {formatMessage(labels.save)}
        </LoadingButton>
      </Column>
    </Grid>
  );
}
