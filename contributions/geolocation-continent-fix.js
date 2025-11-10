// Fix for issue #3701: Geo-location tracking (Country) broken in v3.0
// File: src/lib/detect.ts

// Remove continent code fallback (around line 106):
/*
// Try multiple sources for country code to ensure we get a value
// Note: We don't use continent code as a fallback because it's not a valid ISO country code
const country = 
  result.country?.iso_code || 
  result.registered_country?.iso_code || 
  result.represented_country?.iso_code;
*/