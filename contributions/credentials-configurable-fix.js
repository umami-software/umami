// Fix for issue #3647: Tracker script's omit credentials does not work with Microsoft Entra application proxy authentication
// File: src/tracker/index.js

// Add credentials option (around line 32):
/*
const credentials = attr(_data + 'credentials') || 'omit'; // Default to 'omit' for security
*/

// Use configurable credentials in fetch call (around line 168):
/*
credentials, // Use configurable credentials instead of hardcoded 'omit'
*/