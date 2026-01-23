import { Grid } from '@umami/react-zen';

const LAYOUTS = {
  one: { columns: '1fr' },
  two: {
    columns: {
      xs: '1fr',
      md: 'repeat(auto-fill, minmax(560px, 1fr))',
    },
  },
  three: {
    columns: {
      xs: '1fr',
      md: 'repeat(auto-fill, minmax(360px, 1fr))',
    },
  },
  'one-two': { columns: { xs: '1fr', md: 'repeat(3, 1fr)' } },
  'two-one': { columns: { xs: '1fr', md: 'repeat(3, 1fr)' } },
};

export function GridRow(props: {
  layout?: 'one' | 'two' | 'three' | 'one-two' | 'two-one' | 'compare';
  className?: string;
  children?: any;
}) {
  const { layout = 'two', children, ...otherProps } = props;
  return (
    <Grid gap="3" {...LAYOUTS[layout]} {...otherProps}>
      {children}
    </Grid>
  );
}
