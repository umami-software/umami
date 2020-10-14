import React, { useState } from 'react';
import Button from './Button';
import { FormattedMessage } from 'react-intl';

const defaultText = (
  <FormattedMessage id="label.copy-to-clipboard" defaultMessage="Copy to clipboard" />
);

export default function CopyButton({ element, ...props }) {
  const [text, setText] = useState(defaultText);

  function handleClick() {
    if (element?.current) {
      element.current.select();
      document.execCommand('copy');
      setText(<FormattedMessage id="message.copied" defaultMessage="Copied!" />);
      window.getSelection().removeAllRanges();
    }
  }

  return (
    <Button {...props} onClick={handleClick}>
      {text}
    </Button>
  );
}
