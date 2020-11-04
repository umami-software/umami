import React from 'react';
import ButtonLayout from 'components/layout/ButtonLayout';
import ButtonGroup from './ButtonGroup';

export default function FilterButtons({ buttons, selected, onClick }) {
  return (
    <ButtonLayout>
      <ButtonGroup size="xsmall" items={buttons} selectedItem={selected} onClick={onClick} />
    </ButtonLayout>
  );
}
