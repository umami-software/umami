import React from 'react';
import Button from './Button';
import Refresh from 'assets/redo.svg';

export default function RefreshButton({ onClick }) {
  return <Button icon={<Refresh />} size="small" onClick={onClick} />;
}
