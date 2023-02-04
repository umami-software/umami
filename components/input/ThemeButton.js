import { useTransition, animated } from 'react-spring';
import { Button, Icon, PopupTrigger, Tooltip } from 'react-basics';
import { useIntl } from 'react-intl';
import useTheme from 'hooks/useTheme';
import Icons from 'components/icons';
import { labels } from 'components/messages';
import styles from './ThemeButton.module.css';

export default function ThemeButton({ tooltipPosition = 'top' }) {
  const [theme, setTheme] = useTheme();
  const { formatMessage } = useIntl();

  const transitions = useTransition(theme, {
    initial: { opacity: 1 },
    from: {
      opacity: 0,
      transform: `translateY(${theme === 'light' ? '20px' : '-20px'}) scale(0.5)`,
    },
    enter: { opacity: 1, transform: 'translateY(0px) scale(1.0)' },
    leave: {
      opacity: 0,
      transform: `translateY(${theme === 'light' ? '-20px' : '20px'}) scale(0.5)`,
    },
  });

  function handleClick() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  return (
    <Tooltip label={formatMessage(labels.theme)} position={tooltipPosition}>
      <Button variant="quiet" className={styles.button} onClick={handleClick}>
        {transitions((style, item) => (
          <animated.div key={item} style={style}>
            <Icon className={styles.icon}>{item === 'light' ? <Icons.Sun /> : <Icons.Moon />}</Icon>
          </animated.div>
        ))}
      </Button>
    </Tooltip>
  );
}
