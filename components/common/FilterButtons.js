import React from 'react';
import PropTypes from 'prop-types';
import ButtonLayout from 'components/layout/ButtonLayout';
import ButtonGroup from './ButtonGroup';

function FilterButtons({ buttons, selected, onClick }) {
  return (
    <ButtonLayout>
      <ButtonGroup size="xsmall" items={buttons} selectedItem={selected} onClick={onClick} />
    </ButtonLayout>
  );
}

FilterButtons.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node,
      value: PropTypes.any.isRequired,
    }),
  ),
  selected: PropTypes.any,
  onClick: PropTypes.func,
};

export default FilterButtons;
