import React, { useState } from 'react';
import Button from './Button';

const defaultText = 'Copy to clipboard';

export default function CopyButton({ element, ...props }) {
  const [text, setText] = useState(defaultText);

  function handleClick() {
    if (element?.current) {
      element.current.select();
      document.execCommand('copy');
      setText('Copied!');
      window.getSelection().removeAllRanges();
    }
  }

  return (
    <Button {...props} onClick={handleClick}>
      {text}
    </Button>
  );
}
