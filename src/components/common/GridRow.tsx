import { Grid } from '@umami/react-zen';

const LAYOUTS = {
  one: { columns: '1fr' },
  two: {
    columns: {
      xs: '1fr',
      md: 'repeat(auto-fill, minmax(600px, 1fr))',
    },
  },
  three: {
    columns: {
      xs: '1fr',
      md: 'repeat(auto-fill, minmax(400px, 1fr))',
    },
  },
  'one-two': { columns: { xs: '1fr', lg: 'repeat(3, 1fr)' } },
  'two-one': { columns: { xs: '1fr', lg: 'repeat(3, 1fr)' } },
};

export function GridRow(props: {
  [x: string]: any;
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
