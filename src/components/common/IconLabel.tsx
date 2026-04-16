import { Icon, type IconProps, Row, type RowProps, Text, type TextProps } from '@umami/react-zen';
import type { ReactNode } from 'react';

interface IconLabelProps extends RowProps {
  icon: ReactNode;
  label?: ReactNode;
  weight?: TextProps['weight'];
  iconProps?: Partial<IconProps>;
  labelProps?: Partial<TextProps>;
}

export function IconLabel({
  icon,
  label,
  weight,
  iconProps,
  labelProps,
  children,
  ...props
}: IconLabelProps) {
  return (
    <Row alignItems="center" gap="2" {...props}>
      <Icon {...iconProps}>{icon}</Icon>
      {label && (
        <Text weight={weight} {...labelProps}>
          {label}
        </Text>
      )}
      {children}
    </Row>
  );
}
