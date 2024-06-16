import { useContext, useState } from 'react';
import { ReportContext } from './Report';
import styles from './ReportMenu.module.css';
import { Icon, Icons } from 'react-basics';
import classNames from 'classnames';

export function ReportMenu({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { report } = useContext(ReportContext);

  if (!report) {
    return null;
  }

  return (
    <div className={classNames(styles.menu, collapsed && styles.collapsed)}>
      <div className={styles.button} onClick={() => setCollapsed(!collapsed)}>
        <Icon rotate={collapsed ? -90 : 90}>
          <Icons.ChevronDown />
        </Icon>
      </div>
      {!collapsed && children}
    </div>
  );
}

export default ReportMenu;
