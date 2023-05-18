import Page from 'components/layout/Page';

export default function Report({ children, ...props }) {
  return <Page {...props}>{children}</Page>;
}
