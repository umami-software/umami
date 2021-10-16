import React from 'react';
import classNames from 'classnames';
import styles from './Page.module.css';

export default class Page extends React.Component {
  getSnapshotBeforeUpdate() {
    if (window.pageXOffset === 0 && window.pageYOffset === 0) return null;

    // Return the scrolled position as the snapshot value
    return { x: window.pageXOffset, y: window.pageYOffset };
  }

  /* eslint-disable no-unused-vars */
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      // Restore the scrolled position after re-rendering
      window.scrollTo(snapshot.x, snapshot.y);
    }
  }
  /* eslint-enable no-unused-vars */

  render() {
    const { className, children } = this.props;
    return <div className={classNames(styles.page, className)}>{children}</div>;
  }
}
