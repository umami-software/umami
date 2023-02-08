import { Icon, Button, PopupTrigger, Popup, Tooltip, Text } from 'react-basics';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { languages } from 'lib/lang';
import useLocale from 'hooks/useLocale';
import Icons from 'components/icons';
import { labels } from 'components/messages';
import styles from './LanguageButton.module.css';

export default function LanguageButton({ tooltipPosition = 'top' }) {
  const { formatMessage } = useIntl();
  const { locale, saveLocale } = useLocale();
  const items = Object.keys(languages).map(key => ({ ...languages[key], value: key }));

  function handleSelect(value) {
    saveLocale(value);
  }

  return (
    <PopupTrigger>
      <Tooltip label={formatMessage(labels.language)} position={tooltipPosition}>
        <Button variant="quiet">
          <Icon>
            <Icons.Globe />
          </Icon>
        </Button>
      </Tooltip>
      <Popup position="right" alignment="end">
        <div className={styles.menu}>
          {items.map(({ value, label }) => {
            return (
              <div
                key={value}
                className={classNames(styles.item, { [styles.selected]: value === locale })}
                onClick={handleSelect.bind(null, value)}
              >
                <Text>{label}</Text>
                {value === locale && (
                  <Icon className={styles.icon}>
                    <Icons.Check />
                  </Icon>
                )}
              </div>
            );
          })}
        </div>
      </Popup>
    </PopupTrigger>
  );
}
