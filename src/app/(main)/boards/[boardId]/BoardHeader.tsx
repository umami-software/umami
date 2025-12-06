import { Button, Column, Grid, Heading, Row, TextField } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';

export function BoardHeader() {
  const { formatMessage, labels } = useMessages();
  const defaultName = formatMessage(labels.untitled);
  const name = '';
  const description = '';

  const handleNameChange = (name: string) => {
    //updateReport({ name: name || defaultName });
  };

  const handleDescriptionChange = (description: string) => {
    //updateReport({ description });
  };

  return <h1>asdgfviybiyu8oaero8g9873qrgb875qh0g8</h1>;

  return (
    <Grid
      columns={{ xs: '1fr', md: '1fr 1fr' }}
      paddingY="4"
      marginBottom="6"
      border="bottom"
      gapX="6"
    >
      asdfasdfds
      <Column>
        <Row>
          <TextField
            variant="quiet"
            name="name"
            value={name}
            defaultValue={name}
            placeholder={defaultName}
            onChange={handleNameChange}
            autoComplete="off"
            style={{ fontSize: '2rem', fontWeight: 700, width: '100%' }}
          >
            <Heading size="4">{name}</Heading>
          </TextField>
        </Row>
        <Row>
          <TextField
            variant="quiet"
            name="description"
            value={description}
            defaultValue={description}
            placeholder={`+ ${formatMessage(labels.addDescription)}`}
            autoComplete="off"
            onChange={handleDescriptionChange}
            style={{ width: '100%' }}
          >
            {description}
          </TextField>
        </Row>
      </Column>
      <Column justifyContent="center" alignItems="flex-end">
        <Button variant="primary">{formatMessage(labels.save)}</Button>
      </Column>
    </Grid>
  );
}
