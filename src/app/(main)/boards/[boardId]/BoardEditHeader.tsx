import {
  Button,
  Column,
  Grid,
  Heading,
  LoadingButton,
  Row,
  Text,
  TextField,
} from '@umami/react-zen';
import { useBoard, useMessages, useNavigation } from '@/components/hooks';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';

export function BoardEditHeader() {
  const { board, updateBoard, saveBoard, isPending } = useBoard();
  const { t, labels } = useMessages();
  const { router, renderUrl } = useNavigation();
  const defaultName = t(labels.untitled);

  const handleNameChange = (value: string) => {
    updateBoard({ name: value });
  };

  const handleDescriptionChange = (value: string) => {
    updateBoard({ description: value });
  };

  const handleWebsiteChange = (websiteId: string) => {
    updateBoard({ parameters: { ...board.parameters, websiteId } });
  };

  const handleSave = async () => {
    await saveBoard();
    if (board.id) {
      router.push(renderUrl(`/boards/${board.id}`));
    }
  };

  const handleCancel = () => {
    if (board.id) {
      router.push(renderUrl(`/boards/${board.id}`));
    } else {
      router.push(renderUrl('/boards'));
    }
  };

  return (
    <Grid
      columns={{ base: '1fr', md: '1fr 1fr' }}
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
            <Heading size="xl">{board?.name}</Heading>
          </TextField>
        </Row>
        <Row>
          <TextField
            variant="quiet"
            name="description"
            value={board?.description ?? ''}
            placeholder={`+ ${t(labels.addDescription)}`}
            autoComplete="off"
            onChange={handleDescriptionChange}
            style={{ width: '100%' }}
          >
            {board?.description}
          </TextField>
        </Row>
        <Row alignItems="center" gap="3">
          <Text>{t(labels.website)}</Text>
          <WebsiteSelect websiteId={board?.parameters?.websiteId} onChange={handleWebsiteChange} />
        </Row>
      </Column>
      <Column justifyContent="center" alignItems="flex-end">
        <Row gap="3">
          <Button variant="quiet" onPress={handleCancel}>
            {t(labels.cancel)}
          </Button>
          <LoadingButton variant="primary" onPress={handleSave} isLoading={isPending}>
            {t(labels.save)}
          </LoadingButton>
        </Row>
      </Column>
    </Grid>
  );
}
