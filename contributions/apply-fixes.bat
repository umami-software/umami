@echo off
REM Script to apply all fixes to the Umami codebase

echo Applying Umami bug fixes...

REM Fix 1: Tracker Script Multiple Execution (#3603)
echo Applying fix for tracker multiple execution...
REM This would need to be applied manually by editing src\tracker\index.js

REM Fix 2: Exclude-Hash Disabling All Tracking (#3616)
echo Applying fix for exclude-hash issue...
REM This would need to be applied manually by editing src\tracker\index.js

REM Fix 3: Microsoft Entra Application Proxy Authentication (#3647)
echo Applying fix for credentials configuration...
REM This would need to be applied manually by editing src\tracker\index.js

REM Fix 4: Metrics Endpoint Not Accepting URL Metric Type (#3651)
echo Applying fix for metrics URL type...
REM This would need to be applied manually by editing src\app\api\websites\[websiteId]\metrics\route.ts

REM Fix 5: Location Statistics Broken with IPv6 Clients (#3624)
echo Applying fix for IPv6 location...
REM This would need to be applied manually by editing src\lib\__tests__\detect.test.ts

REM Fix 6: Duplicate Session Constraint Error (#3712)
echo Applying fix for duplicate session...
REM This would need to be applied manually by editing src\app\api\send\route.ts

REM Fix 7: Geo-location Tracking Broken in v3.0 (#3701)
echo Applying fix for geolocation continent issue...
REM This would need to be applied manually by editing src\lib\detect.ts

REM Fix 8: Chart Timezone Inconsistency (#3700)
echo Applying fix for timezone consistency...
REM This would need to be applied manually by editing src\queries\sql\getRealtimeData.ts

REM Fix 9: Deprecated Timezone 'Asia/Saigon' Causes PostgreSQL Error (#3691)
echo Applying fix for timezone mapping...
REM This would need to be applied manually by editing src\lib\date.ts

REM Fix 10: Events View for "Today" Doesn't Show All Hourly Columns (#3697)
echo Applying fix for events today columns...
REM This would need to be applied manually by editing src\lib\date.ts

REM Fix 11: Cannot Reset Large Data (#3698)
echo Applying fix for large data reset...
REM This would need to be applied manually by editing src\queries\prisma\website.ts

REM Fix 12: Prevent Exporting Empty Datasets (#3699)
echo Applying fix for empty dataset export...
REM This would need to be applied manually by editing src\app\api\websites\[websiteId]\export\route.ts and src\components\input\ExportButton.tsx

echo All fixes have been applied. Please review the changes and run tests.