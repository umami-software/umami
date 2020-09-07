import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Globe from 'assets/globe.svg';
import useDocumentClick from 'hooks/useDocumentClick';
import { updateApp } from 'redux/actions/app';
import Menu from './Menu';
import styles from './LanguageButton.module.css';
import Button from './Button';

const supportedLanguages = {
  en: 'EN',
  'zh-CN': '中文',
};

const menuOptions = [
  { label: 'English', value: 'en' },
  { label: '中文 (Chinese Simplified)', value: 'zh-CN' },
];

export default function LanguageButton({ menuPosition = 'bottom', menuAlign = 'left' }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const locale = useSelector(state => state.app.locale);
  const ref = useRef();

  function handleSelect(value) {
    dispatch(updateApp({ locale: value }));
    window.localStorage.setItem('locale', value);
    setShowMenu(false);
  }

  useDocumentClick(e => {
    if (!ref.current.contains(e.target)) {
      setShowMenu(false);
    }
  });

  return (
    <div ref={ref} className={styles.container}>
      <Button icon={<Globe />} onClick={() => setShowMenu(true)} size="small">
        <div>{supportedLanguages[locale]}</div>
      </Button>
      {showMenu && (
        <Menu
          options={menuOptions}
          onSelect={handleSelect}
          float={menuPosition}
          align={menuAlign}
        />
      )}
    </div>
  );
}
