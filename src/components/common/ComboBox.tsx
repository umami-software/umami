import { type ComboBoxProps, type ListProps, ComboBox as ZenComboBox } from '@umami/react-zen';

const defaultListProps: Partial<ListProps> = {
  shouldSelectOnPressUp: true,
  shouldFocusOnHover: false,
  style: {
    maxHeight: 'min(400px, calc(100dvh - 8rem))',
  },
};

export function ComboBox({ listProps, ...props }: ComboBoxProps) {
  const mergedListProps: ListProps = {
    ...defaultListProps,
    ...listProps,
    style: {
      ...defaultListProps.style,
      ...listProps?.style,
    },
  };

  return <ZenComboBox {...props} listProps={mergedListProps} />;
}

export type { ComboBoxProps };
