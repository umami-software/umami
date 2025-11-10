// Fix for issue #3616: Exclude-hash disabling tracking on all pages
// File: src/tracker/index.js

// Fix referrer handling (around line 234):
/*
let currentRef = referrer && referrer.startsWith(origin) ? '' : normalize(referrer);
*/