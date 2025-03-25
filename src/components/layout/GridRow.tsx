import { Grid } from '@umami/react-zen';

const LAYOUTS = {
  one: { columns: '1fr' },
  two: { columns: { xs: '1fr', sm: '1fr', md: '1fr 1fr', lg: '1fr 1fr' } },
  three: { columns: { xs: '1fr', sm: '1fr', md: '1fr 1fr 1fr', lg: '1fr 2fr' } },
  'one-two': { columns: { xs: '1fr', sm: '1fr', md: '1fr 2fr', lg: '1fr 2fr' } },
  'two-one': { columns: { xs: '1fr', sm: '1fr', md: '2fr 1fr', lg: '2fr 1fr', xl: '2fr 1fr' } },
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
