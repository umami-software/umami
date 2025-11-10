// Fix for issue #3691: Deprecated timezone 'Asia/Saigon' causes PostgreSQL error
// File: src/lib/date.ts

// Add timezone mapping (around line 107):
/*
const TIMEZONE_MAPPINGS: Record<string, string> = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
};
*/