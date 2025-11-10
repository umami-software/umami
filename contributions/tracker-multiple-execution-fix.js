// Fix for issue #3603: Add guard to prevent tracker from running multiple times
// File: src/tracker/index.js

// Add at the beginning of the tracker script (around line 1):
/*
if (window.umami && window.umami.version) {
  return;
}
*/

// Add version tracking (around line 220):
/*
if (!window.umami) {
  window.umami = {
    track,
    identify,
    version: '1.0.0' // Add version to indicate initialization
  };
} else {
  // If umami exists but without version, add the functions
  window.umami.track = window.umami.track || track;
  window.umami.identify = window.umami.identify || identify;
  window.umami.version = '1.0.0';
}
*/