import { Container } from 'react-basics';
import Header from './Header';
import Footer from './Footer';

export default function ShareLayout({ children }) {
  return (
    <Container>
      <Header />
      {children}
      <Footer />
    </Container>
  );
}
