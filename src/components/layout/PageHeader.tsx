import { ReactNode } from 'react';
import { Heading, Icon, Breadcrumbs, Breadcrumb, Row } from '@umami/react-zen';

export function PageHeader({
  title,
  icon,
  breadcrumb,
  children,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  className?: string;
  breadcrumb?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <Breadcrumbs>
        <Breadcrumb>{breadcrumb}</Breadcrumb>
      </Breadcrumbs>
      <Row justifyContent="space-between" paddingY="6">
        {icon && <Icon size="lg">{icon}</Icon>}

        {title && <Heading>{title}</Heading>}
        <Row justifyContent="flex-end">{children}</Row>
      </Row>
    </>
  );
}
