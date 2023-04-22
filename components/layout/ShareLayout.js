import { Container } from 'react-basics';
import Header from './Header';
import Footer from './Footer';

export function ShareLayout({ children }) {
  return (
    <Container>
      <Header />
      <main>{children}</main>
      <Footer />
    </Container>
  );
}

export default ShareLayout;
