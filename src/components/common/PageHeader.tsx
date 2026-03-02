import { Column, Grid, Heading, Icon, Row, Text } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { LinkButton } from './LinkButton';

export function PageHeader({
  title,
  description,
  label,
  icon,
  showBorder = true,
  titleHref,
  children,
}: {
  title: string;
  description?: string;
  label?: ReactNode;
  icon?: ReactNode;
  showBorder?: boolean;
  titleHref?: string;
  allowEdit?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Grid
      columns={{ base: '1fr', md: '1fr 1fr' }}
      paddingY="6"
      marginBottom="6"
      border={showBorder ? 'bottom' : undefined}
    >
      <Column gap="2">
        {label}
        <Row alignItems="center" gap="3">
          {icon && (
            <Icon size="md" color="muted">
              {icon}
            </Icon>
          )}
          {title && titleHref ? (
            <LinkButton href={titleHref} variant="quiet">
              <Heading size={{ base: 'lg', md: '2xl', lg: '3xl' }}>{title}</Heading>
            </LinkButton>
          ) : (
            title && <Heading size={{ base: 'lg', md: '2xl', lg: '3xl' }}>{title}</Heading>
          )}
        </Row>
        {description && (
          <Text color="muted" truncate style={{ maxWidth: 600 }} title={description}>
            {description}
          </Text>
        )}
      </Column>
      <Row justifyContent="flex-end" alignItems="center">
        {children}
      </Row>
    </Grid>
  );
}
