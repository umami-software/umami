import { Icon, Button, PopupTrigger, Popup, Tooltip, Icons, Text } from 'react-basics';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { languages } from 'lib/lang';
import useLocale from 'hooks/useLocale';
import { Globe } from 'components/icons';
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
      <PopupTrigger action="hover">
        <Button variant="quiet">
          <Icon>
            <Globe />
          </Icon>
        </Button>
        <Tooltip position={tooltipPosition}>{formatMessage(labels.language)}</Tooltip>
      </PopupTrigger>
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
