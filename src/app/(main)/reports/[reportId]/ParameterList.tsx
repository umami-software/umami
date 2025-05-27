import { ReactNode } from 'react';
import { Icon, Row, Text, Button, Column } from '@umami/react-zen';
import { Close } from '@/components/icons';
import { Empty } from '@/components/common/Empty';
import { useMessages } from '@/components/hooks';

export interface ParameterListProps {
  children?: ReactNode;
}

export function ParameterList({ children }: ParameterListProps) {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap="3">
      {!children && <Empty message={formatMessage(labels.none)} />}
      {children}
    </Column>
  );
}

const Item = ({
  icon,
  onClick,
  onRemove,
  children,
}: {
  icon?: ReactNode;
  onClick?: () => void;
  onRemove?: () => void;
  children?: ReactNode;
}) => {
  return (
    <Row
      gap="3"
      alignItems="center"
      justifyContent="space-between"
      onClick={onClick}
      backgroundColor="2"
      border
      borderRadius="2"
      paddingLeft="3"
      shadow="2"
    >
      {icon && <Icon>{icon}</Icon>}
      <Text>{children}</Text>
      <Button onPress={onRemove} variant="quiet">
        <Icon>
          <Close />
        </Icon>
      </Button>
    </Row>
  );
};

ParameterList.Item = Item;
