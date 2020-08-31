import React from 'react';
import { useDispatch } from 'react-redux';
import { setDateRange } from 'redux/actions/websites';
import Button from './Button';
import Refresh from 'assets/redo.svg';
import { useDateRange } from 'hooks/useDateRange';

export default function RefreshButton({ websiteId }) {
  const dispatch = useDispatch();
  const dateRange = useDateRange(websiteId);

  function handleClick() {
    if (dateRange) {
      dispatch(setDateRange(websiteId, dateRange));
    }
  }

  return <Button icon={<Refresh />} size="small" onClick={handleClick} />;
}
