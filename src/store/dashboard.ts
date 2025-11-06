import { create } from 'zustand';
import { DASHBOARD_CONFIG, DEFAULT_WEBSITE_LIMIT } from '@/lib/constants';
import { getItem, setItem } from '@/lib/storage';

export const initialState = {
  showCharts: true,
  limit: DEFAULT_WEBSITE_LIMIT,
  websiteOrder: [],
  websiteActive: [],
  editing: false,
  isEdited: false,
};

const store = create(() => ({ ...initialState, ...getItem(DASHBOARD_CONFIG) }));

export function saveDashboard(settings) {
  store.setState(settings);

  setItem(DASHBOARD_CONFIG, store.getState());
}

export const useDashboard = store;
