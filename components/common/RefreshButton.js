import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDateRange } from 'redux/actions/websites';
import Button from './Button';
import Refresh from 'assets/redo.svg';

export default function RefreshButton({ websiteId }) {
  const dispatch = useDispatch();
  const dateRange = useSelector(state => state.websites[websiteId]?.dateRange);

  function handleClick() {
    if (dateRange) {
      dispatch(setDateRange(websiteId, { ...dateRange }));
    }
  }

  return <Button icon={<Refresh />} size="small" onClick={handleClick} />;
}
