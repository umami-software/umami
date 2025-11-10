# Umami Bug Fixes

This directory contains fixes for various issues in the Umami analytics platform.

## Fixed Issues

### 1. Tracker Script Multiple Execution (#3603)
- **File**: `tracker-multiple-execution-fix.js`
- **Problem**: Tracker script doesn't prevent multiple executions when included multiple times
- **Solution**: Add version check to prevent multiple initializations

### 2. Exclude-Hash Disabling All Tracking (#3616)
- **File**: `exclude-hash-fix.js`
- **Problem**: Enabling data-exclude-hash disables tracking on all pages
- **Solution**: Fix referrer handling logic

### 3. Microsoft Entra Application Proxy Authentication (#3647)
- **File**: `credentials-configurable-fix.js`
- **Problem**: Tracker script's omit credentials does not work with Microsoft Entra application proxy authentication
- **Solution**: Make credentials configurable

### 4. Metrics Endpoint Not Accepting URL Metric Type (#3651)
- **File**: `metrics-url-type-fix.js`
- **Problem**: The metrics endpoint does not accept the url metric type
- **Solution**: Map 'url' to 'path' for backward compatibility

### 5. Location Statistics Broken with IPv6 Clients (#3624)
- **File**: `ipv6-location-fix.js`
- **Problem**: Location statistics broken when tracking IPv6 clients
- **Solution**: Add IPv6 support tests

### 6. Duplicate Session Constraint Error (#3712)
- **File**: `duplicate-session-fix.js`
- **Problem**: Duplicate violates unique constraint "session_pkey" errors in PostgreSQL logs
- **Solution**: Add proper error handling for duplicate sessions

### 7. Geo-location Tracking Broken in v3.0 (#3701)
- **File**: `geolocation-continent-fix.js`
- **Problem**: Geo-location tracking (Country) broken in v3.0, showing "Unknown" for majority of visitors
- **Solution**: Remove continent code fallback which is not a valid ISO country code

### 8. Chart Timezone Inconsistency (#3700)
- **File**: `timezone-consistency-fix.js`
- **Problem**: Chart timezone is different from realtime page
- **Solution**: Ensure consistent timezone parameter passing

### 9. Deprecated Timezone 'Asia/Saigon' Causes PostgreSQL Error (#3691)
- **File**: `timezone-mapping-fix.js`
- **Problem**: Deprecated timezone 'Asia/Saigon' causes PostgreSQL error in Umami
- **Solution**: Add timezone mapping for 'Asia/Saigon' to 'Asia/Ho_Chi_Minh'

### 10. Events View for "Today" Doesn't Show All Hourly Columns (#3697)
- **File**: `events-today-columns-fix.js`
- **Problem**: Events view for "Today" doesn't show all hourly columns
- **Solution**: Fix time series generation to include all time slots

### 11. Cannot Reset Large Data (#3698)
- **File**: `large-data-reset-fix.js`
- **Problem**: Cannot reset large data due to transaction timeouts
- **Solution**: Implement proper batch deletion

### 12. Prevent Exporting Empty Datasets (#3699)
- **File**: `empty-dataset-export-fix.js`
- **Problem**: Need to prevent exporting empty datasets
- **Solution**: Check if all datasets are empty before creating export

## How to Apply Fixes

Each fix is contained in a separate file that shows the exact changes needed. To apply a fix:

1. Open the corresponding file in the Umami codebase
2. Apply the changes as shown in the fix file
3. Test the changes
4. Submit a pull request

## Testing

Make sure to run the test suite after applying any fixes to ensure no regressions are introduced.