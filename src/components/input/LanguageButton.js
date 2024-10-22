import { Icon, Button, PopupTrigger, Popup, Text } from 'react-basics';
import classNames from 'classnames';
import { languages } from 'lib/lang';
import useLocale from 'components/hooks/useLocale';
import Icons from 'components/icons';
import styles from './LanguageButton.module.css';

export function LanguageButton() {
  const { locale, saveLocale, dir } = useLocale();
  const items = Object.keys(languages).map(key => ({ ...languages[key], value: key }));

  function handleSelect(value, close, e) {
    e.stopPropagation();
    saveLocale(value);
    close();
  }

  return (
    <PopupTrigger>
      <Button variant="quiet">
        <Icon>
          <Icons.Globe />
        </Icon>
      </Button>
      <Popup position="bottom" alignment={dir === 'rtl' ? 'start' : 'end'}>
        {close => {
          return (
            <div className={styles.menu}>
              {items.map(({ value, label }) => {
                return (
                  <div
                    key={value}
                    className={classNames(styles.item, { [styles.selected]: value === locale })}
                    onClick={handleSelect.bind(null, value, close)}
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
          );
        }}
      </Popup>
    </PopupTrigger>
  );
}

export default LanguageButton;
