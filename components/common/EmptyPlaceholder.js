import PropTypes from 'prop-types';
import { Icon, Flexbox } from 'react-basics';
import Logo from 'assets/logo.svg';
import styles from './EmptyPlaceholder.module.css';

function EmptyPlaceholder({ msg, children }) {
  return (
    <div className={styles.placeholder}>
      <Icon className={styles.icon} size="xl">
        <Logo />
      </Icon>
      <h2 className={styles.msg}>{msg}</h2>
      <Flexbox justifyContent="center" alignItems="center">
        {children}
      </Flexbox>
    </div>
  );
}

EmptyPlaceholder.propTypes = {
  msg: PropTypes.node,
  children: PropTypes.node,
};

export default EmptyPlaceholder;
