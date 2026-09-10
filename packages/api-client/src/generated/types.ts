// GENERATED FILE. DO NOT EDIT.
// Source: public/openapi.json — regenerate with `pnpm generate:api`.

export interface paths {
  '/api/2fa/disable': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Disable two-factor authentication
     * @description Disables two-factor authentication for the current user after verifying their password and authenticator code. Rejected when an administrator or team requires it.
     */
    post: operations['disableTwoFactor'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/2fa/setup/cancel': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Cancel two-factor authentication setup
     * @description Deletes the current user's pending setup without changing an already enabled authenticator.
     */
    post: operations['cancelTwoFactorSetup'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/2fa/setup/confirm': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Confirm two-factor authentication setup
     * @description Verifies an authenticator code, enables two-factor authentication, and returns a new set of backup codes.
     */
    post: operations['confirmTwoFactorSetup'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/2fa/setup/initiate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Set up two-factor authentication
     * @description Starts or replaces the current user's pending setup and returns a QR code and manual setup key for an authenticator app.
     */
    post: operations['initiateTwoFactorSetup'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/2fa/status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get two-factor authentication status
     * @description Returns whether two-factor authentication is enabled, configured, or required for the current user, including the reason it is required.
     */
    get: operations['getTwoFactorStatus'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/2fa/verify': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Complete two-factor sign-in
     * @description Exchanges a partial sign-in token and a valid authenticator or backup code for a full authentication token and user details.
     */
    post: operations['verifyTwoFactor'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/admin/2fa/global': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Set the two-factor requirement for everyone
     * @description Enables or disables the installation-wide requirement for users to set up two-factor authentication.
     */
    post: operations['postAdmin2faGlobal'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/admin/teams': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List all teams
     * @description Returns a paginated list of teams with member details and website and member counts for administration.
     */
    get: operations['getAdminTeams'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/admin/teams/{teamId}/2fa': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Set a team's two-factor requirement
     * @description Enables or disables the requirement for members of the specified team to use two-factor authentication.
     */
    post: operations['postAdminTeamsTeamId2fa'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/admin/users': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List all users
     * @description Returns a paginated list of users and their website counts for administration, excluding passwords.
     */
    get: operations['getAdminUsers'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/admin/users/{userId}/2fa': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a user's two-factor status
     * @description Returns whether two-factor authentication is enabled for the specified user.
     */
    get: operations['getAdminUsersUserId2fa'];
    put?: never;
    /**
     * Set a user's two-factor requirement
     * @description Enables or disables the requirement for the specified user to set up two-factor authentication.
     */
    post: operations['postAdminUsersUserId2fa'];
    /**
     * Reset a user's two-factor authentication
     * @description Removes the specified user's authenticator setup, backup codes, used-code history, and failed-attempt limits so they can set up authentication again.
     */
    delete: operations['deleteAdminUsersUserId2fa'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/admin/websites': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List all websites
     * @description Returns a paginated, searchable list of websites across users and teams for administration.
     */
    get: operations['getAdminWebsites'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/auth/login': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Log in
     * @description Authenticates a user with a username and password. Users with two-factor authentication receive a short-lived partial token to complete sign-in.
     */
    post: operations['login'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/auth/logout': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Log out
     * @description Ends the current authentication session by removing its stored token when Redis-backed sessions are enabled.
     */
    post: operations['logout'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/auth/sso': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Create a single sign-on token
     * @description Returns the authenticated user and a new token valid for 24 hours. Requires Redis-backed authentication.
     */
    post: operations['sso'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/auth/subscription': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get subscription details
     * @description Returns subscription and feature availability for the current user or a specified team the user can access.
     */
    get: operations['getSubscription'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/auth/verify': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Verify the current sign-in
     * @description Validates the current authentication credentials and returns the user and their team memberships.
     */
    post: operations['verify'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/batch': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Send a batch of tracking requests
     * @description Processes up to 500 tracking payloads and returns processed and failed counts, individual error details, and a tracking cache token.
     */
    post: operations['batch'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/boards': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List my boards
     * @description Returns a paginated list of the current user's boards, with search and sorting options.
     */
    get: operations['getBoards'];
    put?: never;
    /**
     * Create a board
     * @description Creates a board with a name, type, and configuration, optionally assigned to a team. Validates access to its referenced resources and reports.
     */
    post: operations['createBoard'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/boards/{boardId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a board
     * @description Returns the specified board and its configuration.
     */
    get: operations['getBoard'];
    put?: never;
    /**
     * Update a board
     * @description Updates a board's name, description, or configuration and validates the resources and reports it references.
     */
    post: operations['updateBoard'];
    /**
     * Delete a board
     * @description Deletes the specified board after checking the caller's permission to remove it.
     */
    delete: operations['deleteBoard'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/boards/{boardId}/clone': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Clone a board
     * @description Creates a copy of a board with optional changes to its name, description, and configuration. Removes invalid report references from the copy.
     */
    post: operations['cloneBoard'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/boards/{boardId}/shares': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List shares for a board
     * @description Returns a paginated list of shares for the specified board.
     */
    get: operations['getBoardShares'];
    put?: never;
    /**
     * Create a share for a board
     * @description Creates a named share for the specified board with optional parameters.
     */
    post: operations['createBoardShare'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/config': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get application configuration
     * @description Returns public application settings, including deployment mode, feature availability, and tracker and resource URLs.
     */
    get: operations['getConfig'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/dashboard': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get my dashboard
     * @description Returns the current user's personal dashboard board and its configuration.
     */
    get: operations['getDashboard'];
    put?: never;
    /**
     * Save my dashboard
     * @description Creates or updates the current user's personal dashboard with the supplied name, description, and configuration.
     */
    post: operations['postDashboard'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/heartbeat': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Check application availability
     * @description Returns a simple success response to confirm that the application can serve requests.
     */
    get: operations['getHeartbeat'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/links': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List my links
     * @description Returns a paginated list of the current user's tracked links, with search and sorting options.
     */
    get: operations['getLinks'];
    put?: never;
    /**
     * Create a tracked link
     * @description Creates a tracked link with a name, destination URL, and slug, optionally assigned to a team.
     */
    post: operations['createLink'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/links/{linkId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a tracked link
     * @description Returns the specified tracked link, including its destination URL and slug.
     */
    get: operations['getLink'];
    put?: never;
    /**
     * Update a tracked link
     * @description Updates a tracked link's name, destination URL, or slug.
     */
    post: operations['updateLink'];
    /**
     * Delete a tracked link
     * @description Deletes the specified tracked link after checking the caller's permission to remove it.
     */
    delete: operations['deleteLink'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/links/{linkId}/shares': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List shares for a link
     * @description Returns a paginated list of shares for the specified link.
     */
    get: operations['getLinkShares'];
    put?: never;
    /**
     * Create a share for a link
     * @description Creates a named share for the specified link with optional parameters.
     */
    post: operations['createLinkShare'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/links/charts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get visitor charts for links
     * @description Returns visitor totals and chart data for the requested links the caller can view, within the selected date range.
     */
    get: operations['getLinksCharts'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/me': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get my authentication details
     * @description Returns the current authentication context, including the authenticated user or share credentials.
     */
    get: operations['getMe'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/me/api-keys': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List my API keys
     * @description Returns metadata for the current user's API keys. Available on self-hosted installations.
     */
    get: operations['getMyApiKeys'];
    put?: never;
    /**
     * Create an API key
     * @description Creates a named API key for the current user and returns its secret value. Available on self-hosted installations.
     */
    post: operations['createMyApiKey'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/me/api-keys/{keyId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /**
     * Delete an API key
     * @description Deletes an API key belonging to the current user, revoking its access. Available on self-hosted installations.
     */
    delete: operations['deleteMyApiKey'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/me/password': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Change my password
     * @description Verifies the current password and replaces it with the supplied new password.
     */
    post: operations['updateMyPassword'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/me/teams': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List my team memberships
     * @description Returns a paginated list of teams the current user belongs to, with sorting options.
     */
    get: operations['getMyTeams'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/me/websites': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List my websites
     * @description Returns a paginated list of the current user's websites, optionally including websites accessible through team membership.
     */
    get: operations['getMyWebsites'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/pixels': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List my tracking pixels
     * @description Returns a paginated list of the current user's tracking pixels, with search and sorting options.
     */
    get: operations['getPixels'];
    put?: never;
    /**
     * Create a tracking pixel
     * @description Creates a tracking pixel with a name and slug, optionally assigned to a team.
     */
    post: operations['createPixel'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/pixels/{pixelId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a tracking pixel
     * @description Returns the specified tracking pixel and its configuration.
     */
    get: operations['getPixel'];
    put?: never;
    /**
     * Update a tracking pixel
     * @description Updates a tracking pixel's name or slug.
     */
    post: operations['updatePixel'];
    /**
     * Delete a tracking pixel
     * @description Deletes the specified tracking pixel after checking the caller's permission to remove it.
     */
    delete: operations['deletePixel'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/pixels/{pixelId}/shares': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List shares for a tracking pixel
     * @description Returns a paginated list of shares for the specified tracking pixel.
     */
    get: operations['getPixelShares'];
    put?: never;
    /**
     * Create a share for a tracking pixel
     * @description Creates a named share for the specified tracking pixel with optional parameters.
     */
    post: operations['createPixelShare'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/pixels/charts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get visitor charts for tracking pixels
     * @description Returns visitor totals and chart data for the requested pixels the caller can view, within the selected date range.
     */
    get: operations['getPixelsCharts'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/realtime/{websiteId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get real-time website activity
     * @description Returns recent website activity and visitor data for the real-time view, applying the supplied filters.
     */
    get: operations['getRealtime'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/record': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Send session recordings or heatmap data
     * @description Stores session replay events or heatmap clicks and scrolls for a website, using a valid tracking cache token to identify the session and visit.
     */
    post: operations['record'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reports': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List saved reports
     * @description Returns a paginated list of saved reports for the requested website, optionally filtered by report type.
     */
    get: operations['getReports'];
    put?: never;
    /**
     * Save a report
     * @description Saves a report's name, description, type, and parameters for a website so it can be opened again later.
     */
    post: operations['createReport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reports/{reportId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a saved report
     * @description Returns the specified report's saved name, description, type, and parameters.
     */
    get: operations['getReport'];
    put?: never;
    /**
     * Update a saved report
     * @description Updates the specified report's website, name, description, type, and parameters.
     */
    post: operations['updateReport'];
    /**
     * Delete a saved report
     * @description Deletes the specified saved report definition.
     */
    delete: operations['deleteReport'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reports/attribution': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run an attribution report
     * @description Calculates how traffic sources contribute to conversions using the supplied attribution settings, date range, and filters.
     */
    post: operations['runAttributionReport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reports/breakdown': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run a breakdown report
     * @description Groups website activity by the selected dimensions for the requested date range and filters.
     */
    post: operations['runBreakdownReport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reports/funnel': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run a funnel report
     * @description Calculates visitor progression through a sequence of pages or events using the supplied funnel steps and filters.
     */
    post: operations['runFunnelReport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reports/goal': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run a goal report
     * @description Counts visitors who reached a matching page or triggered a matching event and returns the total visitor count for comparison.
     */
    post: operations['runGoalReport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reports/heatmap': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Get page heatmap data
     * @description Returns recorded click or scroll data for the selected page and date range to display as a heatmap.
     */
    post: operations['runHeatmapReport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reports/journey': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run a visitor journey report
     * @description Returns paths through pages or events using the supplied journey settings and website filters.
     */
    post: operations['runJourneyReport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reports/performance': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run a performance report
     * @description Returns performance trends, summary metrics, and breakdowns by page, page title, device, and browser for the selected website and date range.
     */
    post: operations['runPerformanceReport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reports/retention': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run a retention report
     * @description Calculates how groups of visitors return over time using the supplied retention settings, date range, and filters.
     */
    post: operations['runRetentionReport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reports/revenue': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run a revenue report
     * @description Returns revenue trends, totals with a comparison period, and breakdowns by country, region, referrer, and channel.
     */
    post: operations['runRevenueReport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/reports/utm': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run a campaign report
     * @description Returns traffic breakdowns for UTM source, medium, campaign, term, and content using the supplied date range and filters.
     */
    post: operations['runUtmReport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/scripts/telemetry': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get the installation telemetry script
     * @description Returns JavaScript that sends the application version through a telemetry pixel, or an inactive script when telemetry is disabled.
     */
    get: operations['getScriptsTelemetry'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/send': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Send tracking data
     * @description Collects a pageview, custom event, visitor identification, or performance payload and returns session information and a tracking cache token when accepted.
     */
    post: operations['send'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/share': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Create a share
     * @description Creates a named share for a website, board, link, or pixel with parameters and an optional custom slug.
     */
    post: operations['createShare'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/share/{slug}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Open a share by its slug
     * @description Resolves a public share slug and returns its resource references, parameters, and an access token scoped to the shared resources.
     */
    get: operations['getShareBySlug'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/share/id/{shareId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a share
     * @description Returns a share's configuration by its ID after checking access to the shared resource.
     */
    get: operations['getShare'];
    put?: never;
    /**
     * Update a share
     * @description Updates the specified share's name, slug, and parameters.
     */
    post: operations['updateShare'];
    /**
     * Delete a share
     * @description Deletes the specified share after checking permission to delete shares for its resource.
     */
    delete: operations['deleteShare'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/teams': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List my teams
     * @description Returns a paginated list of teams the current user belongs to, with sorting options.
     */
    get: operations['getTeams'];
    put?: never;
    /**
     * Create a team
     * @description Creates a team with an access code and an owner. Administrators can specify a different user as the owner.
     */
    post: operations['createTeam'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/teams/{teamId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a team
     * @description Returns the specified team's details, including its members.
     */
    get: operations['getTeam'];
    put?: never;
    /**
     * Update a team
     * @description Updates the specified team's name or access code.
     */
    post: operations['updateTeam'];
    /**
     * Delete a team
     * @description Deletes the specified team after checking the caller's permission to remove it.
     */
    delete: operations['deleteTeam'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/teams/{teamId}/boards': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List a team's boards
     * @description Returns a paginated list of boards belonging to the specified team, with search and sorting options.
     */
    get: operations['getTeamBoards'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/teams/{teamId}/links': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List a team's links
     * @description Returns a paginated list of tracked links belonging to the specified team, with search and sorting options.
     */
    get: operations['getTeamLinks'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/teams/{teamId}/pixels': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List a team's tracking pixels
     * @description Returns a paginated list of tracking pixels belonging to the specified team, with search and sorting options.
     */
    get: operations['getTeamPixels'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/teams/{teamId}/users': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List team members
     * @description Returns a paginated list of members of the specified team, including usernames and membership details.
     */
    get: operations['getTeamUsers'];
    put?: never;
    /**
     * Add a team member
     * @description Adds an existing user to the specified team with the supplied team role.
     */
    post: operations['createTeamUser'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/teams/{teamId}/users/{userId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a team member
     * @description Returns the specified user's membership details for a team.
     */
    get: operations['getTeamUser'];
    put?: never;
    /**
     * Change a team member's role
     * @description Updates a user's role in the specified team, subject to the caller's role and permissions.
     */
    post: operations['updateTeamUser'];
    /**
     * Remove a team member
     * @description Removes a user's membership from the specified team, subject to team role and ownership restrictions.
     */
    delete: operations['deleteTeamUser'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/teams/{teamId}/websites': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List a team's websites
     * @description Returns a paginated list of websites belonging to the specified team, with search and sorting options.
     */
    get: operations['getTeamWebsites'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/teams/join': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Join a team
     * @description Adds the current user to a team as a member using the team's access code.
     */
    post: operations['joinTeam'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/users': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Create a user
     * @description Creates a user account with the supplied username, password, and role.
     */
    post: operations['createUser'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/users/{userId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a user
     * @description Returns details for the specified user account when the caller has permission to view it.
     */
    get: operations['getUser'];
    put?: never;
    /**
     * Update a user
     * @description Updates a user's password. Administrators can also change the username and role.
     */
    post: operations['updateUser'];
    /**
     * Delete a user
     * @description Deletes the specified user account. The current user cannot delete their own account through this operation.
     */
    delete: operations['deleteUser'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/users/{userId}/teams': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List a user's teams
     * @description Returns a paginated list of teams for the specified user. Available to that user and administrators.
     */
    get: operations['getUserTeams'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/users/{userId}/websites': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List a user's websites
     * @description Returns a paginated list of the specified user's websites, optionally including team access. Available to that user and administrators.
     */
    get: operations['getUserWebsites'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List websites
     * @description Returns a paginated list of the current user's websites, optionally including websites accessible through team membership.
     */
    get: operations['listWebsites'];
    put?: never;
    /**
     * Create a website
     * @description Creates a website with a name and domain, optionally assigning it to a team and creating a share.
     */
    post: operations['createWebsite'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a website
     * @description Returns the specified website's details and configuration.
     */
    get: operations['getWebsite'];
    put?: never;
    /**
     * Update a website
     * @description Updates a website's name, domain, sharing settings, or recording configuration.
     */
    post: operations['updateWebsite'];
    /**
     * Delete a website
     * @description Deletes the specified website after checking the caller's permission to remove it.
     */
    delete: operations['deleteWebsite'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/active': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get active website visitors
     * @description Returns the number of visitors active on the website in the last few minutes.
     */
    get: operations['getWebsiteActive'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/annotations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List website annotations
     * @description Returns a paginated list of dated notes for the website, optionally filtered by date range or search text.
     */
    get: operations['getWebsiteAnnotations'];
    put?: never;
    /**
     * Create a website annotation
     * @description Adds a dated note to the website, optionally marking it as an all-day annotation.
     */
    post: operations['createWebsiteAnnotation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/annotations/{annotationId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a website annotation
     * @description Returns the date, all-day setting, and note for a specific website annotation.
     */
    get: operations['getWebsiteAnnotation'];
    put?: never;
    /**
     * Update a website annotation
     * @description Changes the date, all-day setting, and note for a website annotation.
     */
    post: operations['updateWebsiteAnnotation'];
    /**
     * Delete a website annotation
     * @description Deletes the specified dated note from the website.
     */
    delete: operations['deleteWebsiteAnnotation'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/attribution': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website attribution */
    get: operations['getWebsiteAttribution'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/breakdown': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website breakdown */
    get: operations['getWebsiteBreakdown'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/daterange': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get the website's available date range
     * @description Returns the earliest and latest recorded event dates for the website.
     */
    get: operations['getWebsiteDateRange'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/event-data': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List events with custom properties
     * @description Returns a page of events in the selected date range, grouping each event's custom property records together.
     */
    get: operations['getEventData'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/event-data-pivot': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List event properties in table form
     * @description Returns a page of occurrences of the specified event, with event details and property keys and values grouped into one row per occurrence.
     */
    get: operations['getEventDataPivot'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/event-data-pivot/array-series': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get event array values over time
     * @description Counts individual values in an array property for the specified event, grouped by value and time interval.
     */
    get: operations['getEventDataArraySeries'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/event-data-pivot/date-series': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get the distribution of event date values
     * @description Counts occurrences of dates stored in the specified event property, grouping by the property's date value within the selected event date range.
     */
    get: operations['getEventDataDateSeries'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/event-data-pivot/numeric-series': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get numeric event properties over time
     * @description Returns the sum, average, or count of a numeric property for the specified event, grouped by time interval.
     */
    get: operations['getEventDataNumericSeries'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/event-data-pivot/numeric-stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get numeric event property statistics
     * @description Returns the total, average, median, minimum, and maximum of the specified numeric event property for the selected date range and filters.
     */
    get: operations['getEventDataNumericStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/event-data-pivot/property-series': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get event property values over time
     * @description Counts occurrences of string values in the specified event property, grouped by value and time interval.
     */
    get: operations['getEventDataPropertySeries'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/event-data/{eventId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get an event's custom properties
     * @description Returns the custom property records, data types, and values attached to a specific event.
     */
    get: operations['getEventDataById'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/event-data/events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Summarize properties by event
     * @description Returns property names, types, and counts grouped by event name. When an event is specified, also groups by property value.
     */
    get: operations['getEventDataEvents'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/event-data/fields': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List event property fields
     * @description Returns property names, data types, and counts for the selected date range, optionally restricted to an event name.
     */
    get: operations['getEventDataFields'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/event-data/properties': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List event property usage
     * @description Returns event names and their custom property names, data types, and record counts for the selected date range and filters.
     */
    get: operations['getEventDataProperties'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/event-data/stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get event property totals
     * @description Returns counts of events with custom data, distinct property names, and property records for the selected date range and filters.
     */
    get: operations['getEventDataStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/event-data/values': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List event property values
     * @description Returns values and their occurrence counts for a custom event property, optionally restricted by event name and data type.
     */
    get: operations['getEventDataValues'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List tracked events
     * @description Returns a page of pageviews and custom events in the date range, newest first. Supports filtering by event name and searching event details.
     */
    get: operations['getWebsiteEvents'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/events/series': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get custom event counts over time
     * @description Returns counts grouped by event name and time interval, optionally limited to the most frequent event names.
     */
    get: operations['getWebsiteEventSeries'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/events/stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get website event statistics
     * @description Returns website event totals for the selected date range and filters, including totals for the comparison period.
     */
    get: operations['getWebsiteEventStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/export': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Export website analytics
     * @description Returns a base64-encoded ZIP archive containing CSV exports of events, pages, referrers, browsers, operating systems, devices, and countries.
     */
    get: operations['exportWebsite'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/funnels': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website funnels */
    get: operations['getWebsiteFunnels'];
    put?: never;
    /** Create website funnel */
    post: operations['createWebsiteFunnel'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/funnels/{funnelId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website funnel */
    get: operations['getWebsiteFunnel'];
    put?: never;
    /** Update website funnel */
    post: operations['updateWebsiteFunnel'];
    /** Delete website funnel */
    delete: operations['deleteWebsiteFunnel'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/funnels/{funnelId}/stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website saved funnel stats */
    get: operations['getWebsiteSavedFunnelStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/funnels/stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website funnel stats */
    get: operations['getWebsiteFunnelStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/goals': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website goals */
    get: operations['getWebsiteGoals'];
    put?: never;
    /** Create website goal */
    post: operations['createWebsiteGoal'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/goals/{goalId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website goal */
    get: operations['getWebsiteGoal'];
    put?: never;
    /** Update website goal */
    post: operations['updateWebsiteGoal'];
    /** Delete website goal */
    delete: operations['deleteWebsiteGoal'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/goals/{goalId}/stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website saved goal stats */
    get: operations['getWebsiteSavedGoalStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/goals/stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website goal stats */
    get: operations['getWebsiteGoalStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/heatmaps': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website heatmaps */
    get: operations['getWebsiteHeatmaps'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/journeys': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website journeys */
    get: operations['getWebsiteJourneys'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/metrics': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get ranked website metrics
     * @description Returns the most frequent values for a dimension such as pages, referrers, countries, browsers, campaigns, or events. Counts pageviews or events for activity dimensions and unique visitors for visitor dimensions.
     */
    get: operations['getWebsiteMetrics'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/metrics/expanded': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get detailed website metrics
     * @description Returns additional analytics for the selected page, event, visitor, or channel dimension, using the supplied date range and filters.
     */
    get: operations['getWebsiteExpandedMetrics'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/pageviews': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get pageviews and sessions over time
     * @description Returns pageviews and sessions grouped by the requested time interval and timezone, including a comparison period when requested.
     */
    get: operations['getWebsitePageviews'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/performance/chart': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website performance chart */
    get: operations['getWebsitePerformanceChart'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/performance/metrics': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website performance metrics */
    get: operations['getWebsitePerformanceMetrics'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/performance/stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website performance stats */
    get: operations['getWebsitePerformanceStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/recorder': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get website recording settings
     * @description Returns public replay and heatmap settings, including sampling, masking, and duration limits. Returns disabled status when recording is unavailable.
     */
    get: operations['getWebsiteRecorderConfig'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/replays': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List website session replays
     * @description Returns a paginated list of recorded sessions for the website, applying date, replay, and search filters.
     */
    get: operations['getWebsiteReplays'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/replays/{replayId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a session replay recording
     * @description Returns the merged recording events, session details, and event and chunk counts for a replay, with optional stopping points by timestamp, chunk, or event index.
     */
    get: operations['getWebsiteReplay'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/replays/saved': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List saved session replays
     * @description Returns a paginated, searchable list of replays saved for the website.
     */
    get: operations['getWebsiteSavedReplays'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/replays/saved/{replayId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Check whether a replay is saved
     * @description Returns whether the specified replay is in the website's saved replays.
     */
    get: operations['getWebsiteReplaySaved'];
    put?: never;
    /**
     * Save or unsave a session replay
     * @description Adds a replay to the website's saved replays with an optional name, or removes it when isSaved is false.
     */
    post: operations['saveWebsiteReplay'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/reports': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List a website's saved reports
     * @description Returns a paginated list of saved report definitions for the website, optionally filtered by report type.
     */
    get: operations['getWebsiteReports'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/reset': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Reset website analytics
     * @description Clears the website's collected analytics data while keeping the website configuration.
     */
    post: operations['resetWebsite'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/retention': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website retention */
    get: operations['getWebsiteRetention'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/revenue/chart': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get website revenue over time
     * @description Returns revenue chart data for the selected currency, date range, and website filters.
     */
    get: operations['getWebsiteRevenueChart'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/revenue/metrics': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get website revenue by dimension
     * @description Returns revenue grouped by the requested dimension, such as country or referrer, for the selected currency and date range.
     */
    get: operations['getWebsiteRevenueMetrics'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/revenue/sessions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List sessions with revenue
     * @description Returns a paginated list of sessions with revenue in the selected currency and date range, applying website and search filters.
     */
    get: operations['getWebsiteRevenueSessions'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/revenue/stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get website revenue totals
     * @description Returns revenue summary statistics for the selected currency and date range, including totals for the comparison period.
     */
    get: operations['getWebsiteRevenueStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/segments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List website segments and cohorts
     * @description Returns saved segments or cohorts for the website, filtered by the requested type and search text.
     */
    get: operations['getWebsiteSegments'];
    put?: never;
    /**
     * Create a website segment or cohort
     * @description Saves a named segment or cohort with its type and filter parameters for the website.
     */
    post: operations['createWebsiteSegment'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/segments/{segmentId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a website segment or cohort
     * @description Returns a saved segment or cohort and its filter parameters for the website.
     */
    get: operations['getWebsiteSegment'];
    put?: never;
    /**
     * Update a website segment or cohort
     * @description Updates a saved segment or cohort's type, name, and filter parameters.
     */
    post: operations['updateWebsiteSegment'];
    /**
     * Delete a website segment or cohort
     * @description Deletes the specified saved segment or cohort from the website.
     */
    delete: operations['deleteWebsiteSegment'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/session-data-pivot': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List session properties in table form
     * @description Returns a page of sessions matching the selected property and filters, with the latest property keys and values grouped into one row per session.
     */
    get: operations['getSessionDataPivot'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/session-data/array-series': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get session array values over time
     * @description Counts distinct sessions for individual values in an array property, grouped by value and time interval.
     */
    get: operations['getSessionDataArraySeries'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/session-data/date-series': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get the distribution of session date values
     * @description Counts distinct sessions by dates stored in the specified custom property, using the selected date range and filters.
     */
    get: operations['getSessionDataDateSeries'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/session-data/numeric-series': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get numeric session properties over time
     * @description Returns the sum, average, or count of a numeric session property, grouped by time interval for the selected date range and filters.
     */
    get: operations['getSessionDataNumericSeries'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/session-data/numeric-stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get numeric session property statistics
     * @description Returns the total, average, median, minimum, and maximum of the specified numeric session property for the selected date range and filters.
     */
    get: operations['getSessionDataNumericStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/session-data/properties': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List session property usage
     * @description Returns custom session property names, data types, and distinct session counts, optionally restricted to sessions with a selected property.
     */
    get: operations['getSessionDataProperties'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/session-data/property-series': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get session property values over time
     * @description Counts distinct sessions for string values in a custom property, grouped by value and time interval.
     */
    get: operations['getSessionDataPropertySeries'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/session-data/stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get activity by session property
     * @description Returns session, visit, pageview, event, and total activity counts grouped by values of the specified session property.
     */
    get: operations['getSessionDataStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/session-data/values': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List session property values
     * @description Returns custom session property values and their occurrence counts, optionally filtered by property name and data type.
     */
    get: operations['getSessionDataValues'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/sessions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List visitor sessions
     * @description Returns a page of visitor sessions in the date range, newest first. Search matches distinct ID, city, browser, operating system, or device.
     */
    get: operations['getWebsiteSessions'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/sessions/{sessionId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a visitor session
     * @description Returns details for a website session, including linked visitor identities and whether session deletion is available to the caller.
     */
    get: operations['getWebsiteSession'];
    put?: never;
    post?: never;
    /**
     * Delete a visitor session
     * @description Deletes the specified session and its associated analytics data. Available on installations using only a relational database.
     */
    delete: operations['deleteWebsiteSession'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/sessions/{sessionId}/activity': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a visitor's session activity
     * @description Returns activity for the specified session and sessions linked by visitor identity, using the requested date range and optional distinct ID.
     */
    get: operations['getWebsiteSessionActivity'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/sessions/{sessionId}/properties': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a session's custom properties
     * @description Returns custom property records, data types, and values for the specified website session.
     */
    get: operations['getWebsiteSessionProperties'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/sessions/{sessionId}/replays': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List a visitor's session replays
     * @description Returns a paginated, searchable list of recordings for the specified website session.
     */
    get: operations['getWebsiteSessionReplays'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/sessions/stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get visitor session statistics
     * @description Returns aggregate session metrics for the website over the selected date range and filters.
     */
    get: operations['getWebsiteSessionStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/sessions/weekly': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get traffic by weekday and hour
     * @description Returns distinct visitor counts grouped by day of the week and hour in the selected timezone and date range.
     */
    get: operations['getWebsiteSessionsWeekly'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/shares': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List shares for a website
     * @description Returns a paginated list of shares for the specified website.
     */
    get: operations['getWebsiteShares'];
    put?: never;
    /**
     * Create a share for a website
     * @description Creates a named share for the specified website with optional parameters.
     */
    post: operations['createWebsiteShare'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get website summary statistics
     * @description Returns pageviews, unique visitors, visits, bounces, and total time on site for the selected date range and comparison period.
     */
    get: operations['getWebsiteStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/transfer': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Transfer website ownership
     * @description Transfers the specified website to another user or team after checking permission for the destination.
     */
    post: operations['transferWebsite'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/utm/metrics': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get website utm metrics */
    get: operations['getWebsiteUtmMetrics'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/{websiteId}/values': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List website filter values
     * @description Returns available values for a website filter, including saved segments or cohorts when requested, to populate filter choices.
     */
    get: operations['getWebsiteValues'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/websites/charts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get visitor charts for websites
     * @description Returns visitor totals and chart data for the requested websites the caller can view, within the selected date range.
     */
    get: operations['getWebsitesCharts'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    ActiveVisitors: {
      /** @description Unique visitor counts for the selected period. */
      visitors: number;
    };
    /** @description Standard Umami API error response. */
    ApiError: {
      /** @description Error details returned when the operation fails. */
      error: {
        code: string;
        /** @description Human-readable explanation of the result. */
        message: string;
        status: number;
      } & {
        [key: string]: unknown;
      };
    };
    CreateWebsiteRequest: {
      /** @description Domain name associated with the resource. */
      domain: string;
      /** @description Unique identifier of the resource. */
      id?: string | null;
      /** @description Display name of the resource. */
      name: string;
      /** @description Identifier used to access a shared resource. */
      shareId?: string | null;
      /** @description ID of the associated team. */
      teamId?: string | null;
    };
    LoginRequest: {
      /** @description Umami password. */
      password: string;
      /** @description Umami username. */
      username: string;
    };
    LoginResponse:
      | {
          /** @description Temporary login token used to complete two-factor authentication. */
          partialToken: string;
          /**
           * @description Whether login requires a second authentication factor.
           * @constant
           */
          requiresTwoFactor: true;
        }
      | {
          token: string;
          /** @description User associated with the resource. */
          user: components['schemas']['LoginUser'];
        };
    LoginTeam: {
      /**
       * Format: uuid
       * @description Unique identifier of the resource.
       */
      id: string;
      /** @description URL of the logo image. */
      logoUrl: string | null;
      /** @description Display name of the resource. */
      name: string;
    };
    LoginUser: {
      /** @description Date and time the record was created. */
      createdAt: string | null;
      /**
       * Format: uuid
       * @description Unique identifier of the resource.
       */
      id: string;
      /** @description Whether the user has administrator privileges. */
      isAdmin: boolean;
      /** @description Permission role assigned to the user. */
      role: string;
      /** @description Teams associated with the user. */
      teams: components['schemas']['LoginTeam'][];
      /** @description Username of the account. */
      username: string;
    };
    MetricRow: {
      t?: string;
      /** @description Dimension value (e.g. a path or country). */
      x: string | null;
      /** @description Count of views/events or unique visitors. */
      y: number;
    };
    MetricRows: components['schemas']['MetricRow'][];
    /** @description Successful operation response. */
    Ok: {
      /**
       * @description Whether the operation succeeded.
       * @constant
       */
      ok: true;
    };
    ReplayConfig: {
      /** @description CSS selector for elements excluded from recordings. */
      blockSelector?: string;
      /** @description Whether heatmap recording is enabled. */
      heatmapEnabled?: boolean;
      /** @description Fraction of sessions to record for heatmaps, from 0 to 1. */
      heatmapSampleRate?: number;
      /**
       * @description Privacy masking level used by the recorder: strict or moderate.
       * @enum {string}
       */
      maskLevel?: 'strict' | 'moderate';
      maxDuration?: number;
      /** @description Whether session replay recording is enabled. */
      replayEnabled?: boolean;
      /** @description Fraction of sessions to record for replay, from 0 to 1. */
      sampleRate?: number;
    } & {
      [key: string]: unknown;
    };
    ReplayConfigInput: {
      /** @description CSS selector for elements excluded from recordings. */
      blockSelector?: string;
      /** @description Whether heatmap recording is enabled. */
      heatmapEnabled?: boolean;
      /** @description Fraction of sessions to record for heatmaps, from 0 to 1. */
      heatmapSampleRate?: number;
      /**
       * @description Privacy masking level used by the recorder: strict or moderate.
       * @enum {string}
       */
      maskLevel?: 'strict' | 'moderate';
      maxDuration?: number;
      /** @description Whether session replay recording is enabled. */
      replayEnabled?: boolean;
      /** @description Fraction of sessions to record for replay, from 0 to 1. */
      sampleRate?: number;
    };
    TimeSeriesPoint: {
      /** @description Bucket start (ISO date/time). */
      x: string;
      /** @description Value for the bucket. */
      y: number;
    };
    UpdateWebsiteRequest: {
      /** @description Domain name associated with the resource. */
      domain?: string;
      /** @description Display name of the resource. */
      name?: string;
      /** @description Session replay and heatmap recording configuration. */
      replayConfig?: components['schemas']['ReplayConfigInput'] | null;
      /** @description Identifier used to access a shared resource. */
      shareId?: string | null;
    };
    Website: {
      /** @description Date and time the record was created. */
      createdAt: string | null;
      /** @description ID of the user who created the resource. */
      createdBy: string | null;
      /** @description Date and time the record was deleted, if applicable. */
      deletedAt: string | null;
      /** @description Domain name associated with the resource. */
      domain: string | null;
      /**
       * Format: uuid
       * @description Unique identifier of the resource.
       */
      id: string;
      /** @description Display name of the resource. */
      name: string;
      /** @description Whether recording is enabled for the website. */
      recorderEnabled: boolean;
      /** @description Session replay and heatmap recording configuration. */
      replayConfig: components['schemas']['ReplayConfig'] | null;
      /** @description Date and time the website analytics were last reset. */
      resetAt: string | null;
      /** @description Identifier used to access a shared resource. */
      shareId: string | null;
      /** @description ID of the associated team. */
      teamId: string | null;
      /** @description Date and time the record was last updated. */
      updatedAt: string | null;
      /** @description User associated with the resource. */
      user?: components['schemas']['WebsiteUser'];
      /** @description ID of the associated user. */
      userId: string | null;
    };
    WebsiteEvent: {
      /**
       * Format: date-time
       * @description Date and time the record was created.
       */
      createdAt: string;
      /** @description Custom identifier assigned to the visitor. */
      distinctId?: string | null;
      /** @description Name of the custom event. */
      eventName?: string | null;
      /** @description Event type: 1 for a pageview or 2 for a custom event. */
      eventType: number;
      /** @description Hostname on which the activity occurred. */
      hostname?: string | null;
      /**
       * Format: uuid
       * @description Unique identifier of the resource.
       */
      id: string;
      /** @description Title of the page. */
      pageTitle?: string | null;
      /** @description Domain of the referring page. */
      referrerDomain?: string | null;
      /**
       * Format: uuid
       * @description ID of the visitor session.
       */
      sessionId: string;
      /** @description Path portion of the page URL. */
      urlPath?: string | null;
      /** @description Query string portion of the page URL. */
      urlQuery?: string | null;
      /**
       * Format: uuid
       * @description ID of the website.
       */
      websiteId: string;
    } & {
      [key: string]: unknown;
    };
    WebsiteEventPage: {
      /** @description Number of matching records. */
      count: number;
      /** @description Data returned by the operation. */
      data: components['schemas']['WebsiteEvent'][];
      /** @description Whether the results were truncated by the maximum result limit. */
      isCapped?: boolean;
      /** @description Page number, starting at 1. */
      page: number;
      /** @description Number of results per page. */
      pageSize: number;
    };
    WebsitePage: {
      /** @description Number of matching records. */
      count: number;
      /** @description Data returned by the operation. */
      data: components['schemas']['Website'][];
      /** @description Field to sort the results by. */
      orderBy?: string;
      /** @description Page number, starting at 1. */
      page: number;
      /** @description Number of results per page. */
      pageSize: number;
      /** @description Search text used to filter results. */
      search?: string;
    };
    WebsitePageviews: {
      /** @description Present when `compare` was requested. */
      compare?: {
        /**
         * Format: date-time
         * @description End of the date range as an ISO 8601 date or date-time.
         */
        endDate: string;
        /** @description Pageview counts for the selected period. */
        pageviews: components['schemas']['TimeSeriesPoint'][];
        sessions: components['schemas']['TimeSeriesPoint'][];
        /**
         * Format: date-time
         * @description Start of the date range as an ISO 8601 date or date-time.
         */
        startDate: string;
      };
      /**
       * Format: date-time
       * @description End of the date range as an ISO 8601 date or date-time.
       */
      endDate?: string;
      /** @description Pageview counts for the selected period. */
      pageviews: components['schemas']['TimeSeriesPoint'][];
      sessions: components['schemas']['TimeSeriesPoint'][];
      /**
       * Format: date-time
       * @description Start of the date range as an ISO 8601 date or date-time.
       */
      startDate?: string;
    };
    WebsiteSession: {
      /** @description Browser used by the visitor. */
      browser: string | null;
      /** @description City of the visitor. */
      city: string | null;
      /** @description Country code of the visitor. */
      country: string | null;
      /**
       * Format: date-time
       * @description Date and time the record was created.
       */
      createdAt: string;
      /** @description Device category used by the visitor. */
      device: string | null;
      /** @description Custom identifier assigned to the visitor. */
      distinctId?: string | null;
      events?: number;
      /**
       * Format: date-time
       * @description Date and time of the first recorded activity.
       */
      firstAt: string;
      /** @description Hostname on which the activity occurred. */
      hostname: string | null;
      /**
       * Format: uuid
       * @description Unique identifier of the resource.
       */
      id: string;
      /** @description Preferred language reported by the visitor browser. */
      language: string | null;
      /**
       * Format: date-time
       * @description Date and time of the most recent recorded activity.
       */
      lastAt: string;
      /** @description Operating system used by the visitor. */
      os: string | null;
      /** @description Region or subdivision of the visitor. */
      region: string | null;
      /** @description Screen resolution of the visitor device. */
      screen: string | null;
      /** @description Pageview counts for the selected period. */
      views: number;
      /** @description Visit counts for the selected period. */
      visits: number;
      /**
       * Format: uuid
       * @description ID of the website.
       */
      websiteId: string;
    } & {
      [key: string]: unknown;
    };
    WebsiteSessionPage: {
      /** @description Number of matching records. */
      count: number;
      /** @description Data returned by the operation. */
      data: components['schemas']['WebsiteSession'][];
      /** @description Whether the results were truncated by the maximum result limit. */
      isCapped?: boolean;
      /** @description Page number, starting at 1. */
      page: number;
      /** @description Number of results per page. */
      pageSize: number;
    };
    WebsiteStats: {
      /** @description Number of visits with only one pageview. */
      bounces: number;
      /** @description The same totals for the comparison period (previous period by default). */
      comparison: components['schemas']['WebsiteStatsValues'];
      /** @description Pageview counts for the selected period. */
      pageviews: number;
      /** @description Total visit duration in seconds. */
      totaltime: number;
      /** @description Unique visitor counts for the selected period. */
      visitors: number;
      /** @description Visit counts for the selected period. */
      visits: number;
    };
    WebsiteStatsValues: {
      /** @description Number of visits with only one pageview. */
      bounces: number;
      /** @description Pageview counts for the selected period. */
      pageviews: number;
      /** @description Total visit duration in seconds. */
      totaltime: number;
      /** @description Unique visitor counts for the selected period. */
      visitors: number;
      /** @description Visit counts for the selected period. */
      visits: number;
    };
    WebsiteUser: {
      /**
       * Format: uuid
       * @description Unique identifier of the resource.
       */
      id: string;
      /** @description Username of the account. */
      username: string;
    };
  };
  responses: {
    /** @description Bad request. */
    BadRequestResponse: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        /**
         * @example {
         *       "error": {
         *         "code": "bad-request",
         *         "message": "Bad request.",
         *         "status": 400
         *       }
         *     }
         */
        'application/json': components['schemas']['ApiError'];
      };
    };
    /** @description Forbidden. */
    ForbiddenResponse: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        /**
         * @example {
         *       "error": {
         *         "code": "forbidden",
         *         "message": "Forbidden.",
         *         "status": 403
         *       }
         *     }
         */
        'application/json': components['schemas']['ApiError'];
      };
    };
    /** @description Not found. */
    NotFoundResponse: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        /**
         * @example {
         *       "error": {
         *         "code": "not-found",
         *         "message": "Not found.",
         *         "status": 404
         *       }
         *     }
         */
        'application/json': components['schemas']['ApiError'];
      };
    };
    /** @description Payload too large. */
    PayloadTooLargeResponse: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        /**
         * @example {
         *       "error": {
         *         "code": "payload-too-large",
         *         "message": "Payload too large.",
         *         "status": 413
         *       }
         *     }
         */
        'application/json': components['schemas']['ApiError'];
      };
    };
    /** @description Server error. */
    ServerErrorResponse: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        /**
         * @example {
         *       "error": {
         *         "code": "server-error",
         *         "message": "Server error.",
         *         "status": 500
         *       }
         *     }
         */
        'application/json': components['schemas']['ApiError'];
      };
    };
    /** @description Service unavailable. */
    ServiceUnavailableResponse: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        /**
         * @example {
         *       "error": {
         *         "code": "service-unavailable",
         *         "message": "Service unavailable.",
         *         "status": 503
         *       }
         *     }
         */
        'application/json': components['schemas']['ApiError'];
      };
    };
    /** @description Unauthorized. */
    UnauthorizedResponse: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        /**
         * @example {
         *       "error": {
         *         "code": "unauthorized",
         *         "message": "Unauthorized.",
         *         "status": 401
         *       }
         *     }
         */
        'application/json': components['schemas']['ApiError'];
      };
    };
  };
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  disableTwoFactor: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Password used to authenticate the account. */
          password: string;
          token: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @description Error details returned when the operation fails. */
                error: {
                  code: string;
                  /**
                   * Format: date-time
                   * @description Time until which further authentication attempts are blocked.
                   */
                  lockedUntil: string;
                  /** @description Human-readable explanation of the result. */
                  message: string;
                };
              }
            | {
                /** @description Whether the operation succeeded. */
                ok: boolean;
              };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Forbidden. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "forbidden",
           *         "message": "Forbidden.",
           *         "status": 403
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description The operation completed successfully. */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Error details returned when the operation fails. */
            error: {
              code: string;
              /**
               * Format: date-time
               * @description Time until which further authentication attempts are blocked.
               */
              lockedUntil: string;
              /** @description Human-readable explanation of the result. */
              message: string;
            };
          };
        };
      };
      /** @description Service unavailable. */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "service-unavailable",
           *         "message": "Service unavailable.",
           *         "status": 503
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  cancelTwoFactorSetup: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Whether the operation succeeded. */
            ok: boolean;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  confirmTwoFactorSetup: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          token: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @description Error details returned when the operation fails. */
                error: {
                  code: string;
                  /**
                   * Format: date-time
                   * @description Time until which further authentication attempts are blocked.
                   */
                  lockedUntil: string;
                  /** @description Human-readable explanation of the result. */
                  message: string;
                };
              }
            | {
                /** @description Single-use backup codes for two-factor authentication. */
                backupCodes: string[];
              };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description The operation completed successfully. */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Error details returned when the operation fails. */
            error: {
              code: string;
              /**
               * Format: date-time
               * @description Time until which further authentication attempts are blocked.
               */
              lockedUntil: string;
              /** @description Human-readable explanation of the result. */
              message: string;
            };
          };
        };
      };
      /** @description Service unavailable. */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "service-unavailable",
           *         "message": "Service unavailable.",
           *         "status": 503
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  initiateTwoFactorSetup: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Secret key for manually configuring an authenticator app. */
            manualKey: string;
            /** @description Data URL of the QR code for authenticator setup. */
            qrCodeDataUrl: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Service unavailable. */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "service-unavailable",
           *         "message": "Service unavailable.",
           *         "status": 503
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getTwoFactorStatus: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @description Whether two-factor authentication is required for all users. */
                globalRequired: boolean;
                /** @description Whether two-factor authentication has been configured. */
                isConfigured: boolean;
                /** @description Whether two-factor authentication is enabled. */
                isEnabled: boolean;
                /** @description Whether two-factor authentication is required for this user. */
                isRequired: boolean;
                /** @description Reason two-factor authentication is required. */
                requiredReason: null;
              }
            | {
                /** @description Whether two-factor authentication is required for all users. */
                globalRequired: boolean;
                /** @description Whether two-factor authentication has been configured. */
                isConfigured: boolean;
                /** @description Whether two-factor authentication is enabled. */
                isEnabled: boolean;
                /** @description Whether two-factor authentication is required for this user. */
                isRequired: boolean;
                /** @description Reason two-factor authentication is required. */
                requiredReason: string;
              };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  verifyTwoFactor: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json':
          | {
              token: string;
            }
          | {
              /** @description Single-use backup code for two-factor authentication. */
              backupCode: string;
            };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @description Error details returned when the operation fails. */
                error: {
                  code: string;
                  /**
                   * Format: date-time
                   * @description Time until which further authentication attempts are blocked.
                   */
                  lockedUntil: string;
                  /** @description Human-readable explanation of the result. */
                  message: string;
                };
              }
            | {
                token: string;
                /** @description User associated with the resource. */
                user: {
                  /**
                   * Format: date-time
                   * @description Date and time the record was created.
                   */
                  createdAt: string;
                  /** @description Unique identifier of the resource. */
                  id: string;
                  /** @description Whether the user has administrator privileges. */
                  isAdmin: boolean;
                  /** @description Permission role assigned to the user. */
                  role: string;
                  /** @description Teams associated with the user. */
                  teams: {
                    /** @description Unique identifier of the resource. */
                    id: string;
                    /** @description URL of the logo image. */
                    logoUrl: string;
                    /** @description Display name of the resource. */
                    name: string;
                  }[];
                  /** @description Username of the account. */
                  username: string;
                };
              };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description The operation completed successfully. */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Error details returned when the operation fails. */
            error: {
              code: string;
              /**
               * Format: date-time
               * @description Time until which further authentication attempts are blocked.
               */
              lockedUntil: string;
              /** @description Human-readable explanation of the result. */
              message: string;
            };
          };
        };
      };
      /** @description Service unavailable. */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "service-unavailable",
           *         "message": "Service unavailable.",
           *         "status": 503
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  postAdmin2faGlobal: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          required: boolean;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Whether the operation succeeded. */
            ok: boolean;
            required: unknown;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Service unavailable. */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "service-unavailable",
           *         "message": "Service unavailable.",
           *         "status": 503
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getAdminTeams: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /** @description Code used to join the team. */
              accessCode: string;
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description URL of the logo image. */
              logoUrl: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Whether two-factor authentication is required. */
              twoFactorRequired: boolean;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  postAdminTeamsTeamId2fa: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated team. */
        teamId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          required: boolean;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Whether the operation succeeded. */
            ok: boolean;
            /** @description ID of the associated team. */
            teamId: string;
            /** @description Whether two-factor authentication is required. */
            twoFactorRequired: unknown;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Service unavailable. */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "service-unavailable",
           *         "message": "Service unavailable.",
           *         "status": 503
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getAdminUsers: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              _count?: {
                websites: number;
              };
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Permission role assigned to the user. */
              role: string;
              /** @description Whether two-factor authentication is required. */
              twoFactorRequired: boolean;
              /** @description Username of the account. */
              username: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getAdminUsersUserId2fa: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated user. */
        userId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Whether two-factor authentication is enabled. */
            isEnabled: boolean;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  postAdminUsersUserId2fa: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated user. */
        userId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          required: boolean;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Whether the operation succeeded. */
            ok: boolean;
            /** @description Whether two-factor authentication is required. */
            twoFactorRequired: unknown;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Service unavailable. */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "service-unavailable",
           *         "message": "Service unavailable.",
           *         "status": 503
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteAdminUsersUserId2fa: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated user. */
        userId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Whether the operation succeeded. */
            ok: boolean;
            reset: {
              /** @description Single-use backup codes for two-factor authentication. */
              backupCodes: unknown;
              otpUsed: unknown;
              rateLimit: unknown;
              twoFactorAuth: unknown;
            };
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getAdminWebsites: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: ({
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description ID of the user who created the resource. */
              createdBy: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Domain name associated with the resource. */
              domain: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Whether recording is enabled for the website. */
              recorderEnabled: boolean;
              /** @description Session replay and heatmap recording configuration. */
              replayConfig:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              /**
               * Format: date-time
               * @description Date and time the website analytics were last reset.
               */
              resetAt: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            } & {
              /** @description User who created the resource. */
              createUser?: {
                /** @description Unique identifier of the resource. */
                id: string;
                /** @description Username of the account. */
                username: string;
              };
              /** @description Identifier used to access a shared resource. */
              shareId: string;
              /** @description Team associated with the resource. */
              team?: {
                /** @description Members of the team. */
                members: {
                  /** @description Permission role assigned to the user. */
                  role: string;
                  /** @description ID of the associated user. */
                  userId: string;
                }[];
              };
              /** @description User associated with the resource. */
              user?: {
                /** @description Unique identifier of the resource. */
                id: string;
                /** @description Username of the account. */
                username: string;
              };
            })[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  login: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['LoginRequest'];
      };
    };
    responses: {
      /** @description Authenticated successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['LoginResponse'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Service unavailable. */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "service-unavailable",
           *         "message": "Service unavailable.",
           *         "status": 503
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  logout: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  sso: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            token: string;
            /** @description User associated with the resource. */
            user: unknown;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Server error. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "server-error",
           *         "message": "Server error.",
           *         "status": 500
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getSubscription: {
    parameters: {
      query?: {
        /** @description ID of the associated team. */
        teamId?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @description Error details returned when the operation fails. */
                error: {
                  code: string;
                  /** @description Human-readable explanation of the result. */
                  message: string;
                  status: number;
                };
              }
            | {
                hasSubscription: boolean;
                isBusiness: boolean;
                isNoBilling: boolean;
                isPro: boolean;
                unlimitedWebsites: boolean;
              };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  verify: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Teams associated with the user. */
            teams: unknown;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  batch: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          [key: string]: unknown;
        }[];
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            cache: unknown;
            details: unknown[];
            errors: number;
            processed: number;
            size: unknown;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Server error. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "server-error",
           *         "message": "Server error.",
           *         "status": 500
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getBoards: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Description of the resource. */
              description: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Configuration parameters for the resource. */
              parameters:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              /** @description ID of the associated team. */
              teamId: string;
              type: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createBoard: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Description of the resource. */
          description?: string;
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters?: {
            /**
             * Format: uuid
             * @description ID of the tracked link.
             */
            linkId?: string;
            /**
             * Format: uuid
             * @description ID of the tracking pixel.
             */
            pixelId?: string;
            /**
             * Format: uuid
             * @description ID of the website.
             */
            websiteId?: string;
          };
          /** @description ID of the associated team. */
          teamId?: string | null;
          type: never | 'open';
          /** @description ID of the associated user. */
          userId?: string | null;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Description of the resource. */
            description: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /** @description ID of the associated team. */
            teamId: string;
            type: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getBoard: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the board. */
        boardId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Description of the resource. */
            description: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /** @description ID of the associated team. */
            teamId: string;
            type: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updateBoard: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the board. */
        boardId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Description of the resource. */
          description?: string;
          /** @description Display name of the resource. */
          name?: string;
          /** @description Configuration parameters for the resource. */
          parameters?: Record<string, never>;
          type?: never | 'open';
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Description of the resource. */
            description: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /** @description ID of the associated team. */
            teamId: string;
            type: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Server error. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "server-error",
           *         "message": "Server error.",
           *         "status": 500
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteBoard: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the board. */
        boardId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  cloneBoard: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the board. */
        boardId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Description of the resource. */
          description?: string;
          /** @description Display name of the resource. */
          name?: string;
          /** @description Configuration parameters for the resource. */
          parameters?: Record<string, never>;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Description of the resource. */
            description: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /** @description ID of the associated team. */
            teamId: string;
            type: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getBoardShares: {
    parameters: {
      query?: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the board. */
        boardId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description ID of the resource being shared. */
              entityId: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Configuration parameters for the resource. */
              parameters:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              /** @description Type of resource made available by the share. */
              shareType: number;
              /** @description URL slug used to access the resource. */
              slug: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createBoardShare: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the board. */
        boardId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters?: {
            [key: string]: unknown;
          };
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description ID of the resource being shared. */
            entityId: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /** @description Type of resource made available by the share. */
            shareType: number;
            /** @description URL slug used to access the resource. */
            slug: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getConfig: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            cloudMode: boolean;
            faviconUrl: string;
            linksUrl: string;
            pixelsUrl: string;
            privateMode: boolean;
            sessionDeletionEnabled: boolean;
            telemetryDisabled: boolean;
            trackerScriptName: string;
            updatesDisabled: boolean;
          };
        };
      };
    };
  };
  getDashboard: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Description of the dashboard. */
            description: string;
            /** @description Dashboard board ID, equal to the owning user ID. */
            id: string;
            /** @description Display name of the dashboard. */
            name: string;
            /** @description Dashboard configuration, including components, layout, and saved reports. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /** @description ID of the associated team, if any. */
            teamId: string;
            /** @description Board type used for the dashboard. */
            type: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the user who owns the dashboard. */
            userId: string;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  postDashboard: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Description of the dashboard. */
          description?: string;
          /** @description Display name of the dashboard. */
          name?: string;
          /** @description Dashboard configuration, including components, layout, and saved reports. */
          parameters?: Record<string, never>;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Description of the dashboard. */
            description: string;
            /** @description Dashboard board ID, equal to the owning user ID. */
            id: string;
            /** @description Display name of the dashboard. */
            name: string;
            /** @description Dashboard configuration, including components, layout, and saved reports. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /** @description ID of the associated team, if any. */
            teamId: string;
            /** @description Board type used for the dashboard. */
            type: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the user who owns the dashboard. */
            userId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getHeartbeat: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Whether the operation succeeded. */
            ok: boolean;
          };
        };
      };
    };
  };
  getLinks: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description URL slug used to access the resource. */
              slug: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description URL associated with the resource. */
              url: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createLink: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Unique identifier of the resource. */
          id?: string | null;
          /** @description Display name of the resource. */
          name: string;
          /** @description URL slug used to access the resource. */
          slug: string;
          /** @description ID of the associated team. */
          teamId?: string | null;
          /** @description URL associated with the resource. */
          url: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Date and time the record was deleted, if applicable.
             */
            deletedAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description URL slug used to access the resource. */
            slug: string;
            /** @description ID of the associated team. */
            teamId: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description URL associated with the resource. */
            url: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getLink: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the tracked link. */
        linkId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Date and time the record was deleted, if applicable.
             */
            deletedAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description URL slug used to access the resource. */
            slug: string;
            /** @description ID of the associated team. */
            teamId: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description URL associated with the resource. */
            url: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updateLink: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the tracked link. */
        linkId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Display name of the resource. */
          name?: string;
          /** @description URL slug used to access the resource. */
          slug?: string;
          /** @description URL associated with the resource. */
          url?: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Date and time the record was deleted, if applicable.
             */
            deletedAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description URL slug used to access the resource. */
            slug: string;
            /** @description ID of the associated team. */
            teamId: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description URL associated with the resource. */
            url: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Server error. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "server-error",
           *         "message": "Server error.",
           *         "status": 500
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteLink: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the tracked link. */
        linkId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getLinkShares: {
    parameters: {
      query?: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the tracked link. */
        linkId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description ID of the resource being shared. */
              entityId: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Configuration parameters for the resource. */
              parameters:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              /** @description Type of resource made available by the share. */
              shareType: number;
              /** @description URL slug used to access the resource. */
              slug: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createLinkShare: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the tracked link. */
        linkId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters?: {
            [key: string]: unknown;
          };
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description ID of the resource being shared. */
            entityId: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /** @description Type of resource made available by the share. */
            shareType: number;
            /** @description URL slug used to access the resource. */
            slug: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getLinksCharts: {
    parameters: {
      query: {
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description Comma-separated resource IDs. Provide between 1 and 20 IDs. */
        ids: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Data returned by the operation. */
            data: {
              [key: string]: {
                total: number;
                values: number[];
              };
            };
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getMe: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description API key authentication details. */
            apiKey?: {
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
            };
            authType?: 'session' | 'share' | 'api-key';
            shareToken?: {
              /** @description ID of the board. */
              boardId?: string;
              /** @description ID of the tracked link. */
              linkId?: string;
              linkIds?: string[];
              /** @description Configuration parameters for the resource. */
              parameters?: {
                allowFilter?: boolean;
                theme?: 'light' | 'dark';
              } & {
                [key: string]: false | true | 'light' | 'dark';
              };
              /** @description ID of the tracking pixel. */
              pixelId?: string;
              pixelIds?: string[];
              /** @description Type of resource made available by the share. */
              shareType?: number;
              /** @description ID of the website. */
              websiteId?: string;
              websiteIds?: string[];
            };
            /** @description User associated with the resource. */
            user?: {
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Whether the user has administrator privileges. */
              isAdmin: boolean;
              /** @description Permission role assigned to the user. */
              role: string;
              /** @description Username of the account. */
              username: string;
            };
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getMyApiKeys: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Visible prefix used to identify an API key. */
            keyPrefix: string;
            /**
             * Format: date-time
             * @description Date and time the credential was last used.
             */
            lastUsedAt: string;
            /** @description Display name of the resource. */
            name: string;
          }[];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createMyApiKey: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Display name of the resource. */
          name: unknown;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            key: string;
            /** @description Visible prefix used to identify an API key. */
            keyPrefix: string;
            /** @description Display name of the resource. */
            name: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteMyApiKey: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the API key. */
        keyId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updateMyPassword: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Current account password. */
          currentPassword: string;
          /** @description New password to set for the account. */
          newPassword: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Permission role assigned to the user. */
            role: string;
            /** @description Username of the account. */
            username: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getMyTeams: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /** @description Code used to join the team. */
              accessCode: string;
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description URL of the logo image. */
              logoUrl: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Whether two-factor authentication is required. */
              twoFactorRequired: boolean;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getMyWebsites: {
    parameters: {
      query?: {
        /** @description Set a non-empty value to include websites accessible through team membership. */
        includeTeams?: string;
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: ({
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description ID of the user who created the resource. */
              createdBy: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Domain name associated with the resource. */
              domain: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Whether recording is enabled for the website. */
              recorderEnabled: boolean;
              /** @description Session replay and heatmap recording configuration. */
              replayConfig:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              /**
               * Format: date-time
               * @description Date and time the website analytics were last reset.
               */
              resetAt: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            } & {
              /** @description User who created the resource. */
              createUser?: {
                /** @description Unique identifier of the resource. */
                id: string;
                /** @description Username of the account. */
                username: string;
              };
              /** @description Identifier used to access a shared resource. */
              shareId: string;
              /** @description Team associated with the resource. */
              team?: {
                /** @description Members of the team. */
                members: {
                  /** @description Permission role assigned to the user. */
                  role: string;
                  /** @description ID of the associated user. */
                  userId: string;
                }[];
              };
              /** @description User associated with the resource. */
              user?: {
                /** @description Unique identifier of the resource. */
                id: string;
                /** @description Username of the account. */
                username: string;
              };
            })[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getPixels: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description URL slug used to access the resource. */
              slug: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createPixel: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Unique identifier of the resource. */
          id?: string | null;
          /** @description Display name of the resource. */
          name: string;
          /** @description URL slug used to access the resource. */
          slug: string;
          /** @description ID of the associated team. */
          teamId?: string | null;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Date and time the record was deleted, if applicable.
             */
            deletedAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description URL slug used to access the resource. */
            slug: string;
            /** @description ID of the associated team. */
            teamId: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getPixel: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the tracking pixel. */
        pixelId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Date and time the record was deleted, if applicable.
             */
            deletedAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description URL slug used to access the resource. */
            slug: string;
            /** @description ID of the associated team. */
            teamId: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updatePixel: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the tracking pixel. */
        pixelId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Display name of the resource. */
          name?: string;
          /** @description URL slug used to access the resource. */
          slug?: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Date and time the record was deleted, if applicable.
             */
            deletedAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description URL slug used to access the resource. */
            slug: string;
            /** @description ID of the associated team. */
            teamId: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Server error. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "server-error",
           *         "message": "Server error.",
           *         "status": 500
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deletePixel: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the tracking pixel. */
        pixelId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getPixelShares: {
    parameters: {
      query?: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the tracking pixel. */
        pixelId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description ID of the resource being shared. */
              entityId: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Configuration parameters for the resource. */
              parameters:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              /** @description Type of resource made available by the share. */
              shareType: number;
              /** @description URL slug used to access the resource. */
              slug: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createPixelShare: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the tracking pixel. */
        pixelId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters?: {
            [key: string]: unknown;
          };
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description ID of the resource being shared. */
            entityId: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /** @description Type of resource made available by the share. */
            shareType: number;
            /** @description URL slug used to access the resource. */
            slug: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getPixelsCharts: {
    parameters: {
      query: {
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description Comma-separated resource IDs. Provide between 1 and 20 IDs. */
        ids: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Data returned by the operation. */
            data: {
              [key: string]: {
                total: number;
                values: number[];
              };
            };
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getRealtime: {
    parameters: {
      query?: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            countries: {
              [key: string]: number;
            };
            events: {
              __type: 'event' | 'session' | 'pageview';
              /** @description Browser used by the visitor. */
              browser: string;
              /** @description Country code of the visitor. */
              country: string;
              /** @description Date and time the record was created. */
              createdAt: string;
              /** @description Device category used by the visitor. */
              device: string;
              /** @description Name of the custom event. */
              eventName: string;
              /** @description Hostname on which the activity occurred. */
              hostname: string;
              /** @description Operating system used by the visitor. */
              os: string;
              /** @description Domain of the referring page. */
              referrerDomain: string;
              /** @description ID of the visitor session. */
              sessionId: string;
              /** @description Path portion of the page URL. */
              urlPath: string;
            }[];
            referrers: {
              [key: string]: number;
            };
            series: {
              /** @description Pageview counts for the selected period. */
              views: {
                t: string;
                x: string;
                y: number;
              }[];
              /** @description Unique visitor counts for the selected period. */
              visitors: {
                t: string;
                x: string;
                y: number;
              }[];
            };
            timestamp: number;
            totals: {
              countries: number;
              events: number;
              /** @description Pageview counts for the selected period. */
              views: number;
              /** @description Unique visitor counts for the selected period. */
              visitors: number;
            };
            urls: {
              [key: string]: number;
            };
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  record: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json':
          | {
              payload: {
                events: unknown[];
                timestamp?: number;
                /** Format: uuid */
                website: string;
              };
              /** @constant */
              type: 'record';
            }
          | {
              payload: {
                events: (
                  | {
                      /** @description Page height in pixels. */
                      pageH?: number;
                      /** @description Page width in pixels. */
                      pageW?: number;
                      /** @description Horizontal position on the page in pixels. */
                      pageX?: number;
                      /** @description Vertical position on the page in pixels. */
                      pageY?: number;
                      timestamp?: number;
                      /** @constant */
                      type: 'click';
                      /** @description URL associated with the resource. */
                      url: string;
                      /** @description Viewport height in pixels. */
                      viewportH?: number;
                      /** @description Viewport width in pixels. */
                      viewportW?: number;
                      x?: number;
                      y?: number;
                    }
                  | {
                      /** @description Page height in pixels. */
                      pageH?: number;
                      /** @description Page width in pixels. */
                      pageW?: number;
                      scrollPct?: number;
                      timestamp?: number;
                      /** @constant */
                      type: 'scroll';
                      /** @description URL associated with the resource. */
                      url: string;
                      /** @description Viewport height in pixels. */
                      viewportH?: number;
                      /** @description Viewport width in pixels. */
                      viewportW?: number;
                    }
                )[];
                timestamp?: number;
                /** Format: uuid */
                website: string;
              };
              /** @constant */
              type: 'heatmap';
            };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @description Whether the operation succeeded. */
                ok: boolean;
              }
            | {
                /** @description Whether the operation succeeded. */
                ok: boolean;
                reason: string;
              }
            | {
                beep: string;
              };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Forbidden. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "forbidden",
           *         "message": "Forbidden.",
           *         "status": 403
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Payload too large. */
      413: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "payload-too-large",
           *         "message": "Payload too large.",
           *         "status": 413
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Server error. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "server-error",
           *         "message": "Server error.",
           *         "status": 500
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getReports: {
    parameters: {
      query: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Type of resource or analytics dimension to return. */
        type?: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: ({
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Description of the resource. */
              description: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Configuration parameters for the resource. */
              parameters:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              type: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
              /** @description ID of the website. */
              websiteId: string;
            } & {
              website?: {
                /** @description Domain name associated with the resource. */
                domain: string;
                /** @description ID of the associated user. */
                userId: string;
              };
            })[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createReport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Description of the resource. */
          description?: string;
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /**
           * Format: uuid
           * @description ID of the website.
           */
          websiteId: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Description of the resource. */
            description: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            type: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
            /** @description ID of the website. */
            websiteId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getReport: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the saved report. */
        reportId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Description of the resource. */
            description: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            type: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
            /** @description ID of the website. */
            websiteId: string;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updateReport: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the saved report. */
        reportId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Description of the resource. */
          description?: string;
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /**
           * Format: uuid
           * @description ID of the website.
           */
          websiteId: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Description of the resource. */
            description: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            type: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
            /** @description ID of the website. */
            websiteId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteReport: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the saved report. */
        reportId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  runAttributionReport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Filters applied to the analytics data. */
          filters: {
            [key: string]: unknown;
          };
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /**
           * Format: uuid
           * @description ID of the website.
           */
          websiteId: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            paidAds: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            /** @description URL of the referring page. */
            referrer: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            total: {
              /** @description Pageview counts for the selected period. */
              pageviews: number;
              /** @description Unique visitor counts for the selected period. */
              visitors: number;
              /** @description Visit counts for the selected period. */
              visits: number;
            };
            utm_campaign: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            utm_content: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            utm_medium: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            utm_source: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            utm_term: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  runBreakdownReport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Filters applied to the analytics data. */
          filters: {
            [key: string]: unknown;
          };
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /**
           * Format: uuid
           * @description ID of the website.
           */
          websiteId: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': ({
            /** @description Number of visits with only one pageview. */
            bounces: number;
            /** @description Total visit duration in seconds. */
            totaltime: number;
            /** @description Pageview counts for the selected period. */
            views: number;
            /** @description Unique visitor counts for the selected period. */
            visitors: number;
            /** @description Visit counts for the selected period. */
            visits: number;
          } & {
            [key: string]: string | number;
          })[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  runFunnelReport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Filters applied to the analytics data. */
          filters: {
            [key: string]: unknown;
          };
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /**
           * Format: uuid
           * @description ID of the website.
           */
          websiteId: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            dropoff: number;
            dropped: number;
            /** @description Filters applied to the analytics data. */
            filters?: {
              operator: string;
              property: string;
              value: string;
            }[];
            previous: number;
            remaining: number;
            type: string;
            value: string;
            /** @description Unique visitor counts for the selected period. */
            visitors: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  runGoalReport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Filters applied to the analytics data. */
          filters: {
            [key: string]: unknown;
          };
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /**
           * Format: uuid
           * @description ID of the website.
           */
          websiteId: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            num: number;
            total: number;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  runHeatmapReport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Filters applied to the analytics data. */
          filters: {
            [key: string]: unknown;
          };
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /**
           * Format: uuid
           * @description ID of the website.
           */
          websiteId: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            mode: 'click' | 'scroll';
            pages: {
              /** @description Number of matching records. */
              count: number;
              sessions: number;
              /** @description Path portion of the page URL. */
              urlPath: string;
            }[];
            points: {
              /** @description Number of matching records. */
              count: number;
              /** @description Page height in pixels. */
              pageH: number;
              /** @description Page width in pixels. */
              pageW: number;
              /** @description Horizontal position on the page in pixels. */
              pageX: number;
              /** @description Vertical position on the page in pixels. */
              pageY: number;
              /** @description Viewport height in pixels. */
              viewportH: number;
              /** @description Viewport width in pixels. */
              viewportW: number;
              x: number;
              y: number;
            }[];
            scroll: {
              buckets: {
                depth: number;
                /** @description Page height in pixels. */
                pageH: number;
                /** @description Page width in pixels. */
                pageW: number;
                sessions: number;
                /** @description Viewport height in pixels. */
                viewportH: number;
                /** @description Viewport width in pixels. */
                viewportW: number;
              }[];
              /** @description Page height in pixels. */
              pageH: number;
              /** @description Page width in pixels. */
              pageW: number;
              totalSessions: number;
              /** @description Viewport height in pixels. */
              viewportH: number;
              /** @description Viewport width in pixels. */
              viewportW: number;
            };
            snapshot: {
              /** @description Unique identifier of the resource. */
              id: string;
              /** @constant */
              kind: 'iframe';
              /** @description Page height in pixels. */
              pageH: number;
              /** @description Page width in pixels. */
              pageW: number;
              /** @description URL associated with the resource. */
              url: string;
              /** @description Viewport height in pixels. */
              viewportH: number;
              /** @description Viewport width in pixels. */
              viewportW: number;
            };
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  runJourneyReport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Filters applied to the analytics data. */
          filters: {
            [key: string]: unknown;
          };
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /**
           * Format: uuid
           * @description ID of the website.
           */
          websiteId: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            e1: string;
            e2: string;
            e3: string;
            e4: string;
            e5: string;
            e6: string;
            e7: string;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  runPerformanceReport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Filters applied to the analytics data. */
          filters: {
            [key: string]: unknown;
          };
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /**
           * Format: uuid
           * @description ID of the website.
           */
          websiteId: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            browsers: unknown;
            chart: unknown;
            devices: unknown;
            pages: unknown;
            pageTitles: unknown;
            summary: unknown;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  runRetentionReport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Filters applied to the analytics data. */
          filters: {
            [key: string]: unknown;
          };
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /**
           * Format: uuid
           * @description ID of the website.
           */
          websiteId: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            date: string;
            day: number;
            percentage: number;
            returnVisitors: number;
            /** @description Unique visitor counts for the selected period. */
            visitors: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  runRevenueReport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Filters applied to the analytics data. */
          filters: {
            [key: string]: unknown;
          };
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /**
           * Format: uuid
           * @description ID of the website.
           */
          websiteId: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            channel: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            chart: {
              /** @description Number of matching records. */
              count: number;
              t: string;
              x: string;
              y: number;
            }[];
            /** @description Country code of the visitor. */
            country: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            /** @description URL of the referring page. */
            referrer: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            /** @description Region or subdivision of the visitor. */
            region: {
              /** @description Country code of the visitor. */
              country: string;
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            total: unknown;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  runUtmReport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Filters applied to the analytics data. */
          filters: {
            [key: string]: unknown;
          };
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /**
           * Format: uuid
           * @description ID of the website.
           */
          websiteId: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            utm_campaign: unknown[];
            utm_content: unknown[];
            utm_medium: unknown[];
            utm_source: unknown[];
            utm_term: unknown[];
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getScriptsTelemetry: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful response. The response shape is inferred as free-form because the handler does not expose a reusable response schema. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'text/javascript': string;
        };
      };
    };
  };
  send: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          payload: {
            /** @description Browser used by the visitor. */
            browser?: string;
            cls?: number;
            /** @description Data returned by the operation. */
            data?: {
              [key: string]: unknown;
            };
            /** @description Device category used by the visitor. */
            device?: string;
            fcp?: number;
            /** @description Hostname on which the activity occurred. */
            hostname?: string;
            /** @description Unique identifier of the resource. */
            id?: string;
            inp?: number;
            ip?: string;
            /** @description Preferred language reported by the visitor browser. */
            language?: string;
            lcp?: number;
            /** Format: uuid */
            link?: string;
            /** @description Display name of the resource. */
            name?: unknown;
            /** @description Operating system used by the visitor. */
            os?: string;
            /** Format: uuid */
            pixel?: string;
            /** @description URL of the referring page. */
            referrer?: string;
            /** @description Screen resolution of the visitor device. */
            screen?: string;
            /** @description Tag attached to the tracked activity. */
            tag?: unknown;
            timestamp?: number;
            /** @description Title of the page. */
            title?: string;
            ttfb?: number;
            /** @description URL associated with the resource. */
            url?: string;
            userAgent?: string;
            /** Format: uuid */
            website?: string;
          };
          /** @enum {string} */
          type: 'event' | 'identify' | 'performance';
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                beep: string;
              }
            | {
                cache: unknown;
                /** @description ID of the visitor session. */
                sessionId: unknown;
                /** @description ID of the visit. */
                visitId: unknown;
              };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Forbidden. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "forbidden",
           *         "message": "Forbidden.",
           *         "status": 403
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Server error. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "server-error",
           *         "message": "Server error.",
           *         "status": 500
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createShare: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /**
           * Format: uuid
           * @description ID of the resource being shared.
           */
          entityId: string;
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          /** @description Type of resource made available by the share. */
          shareType: number;
          /** @description URL slug used to access the resource. */
          slug?: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description ID of the resource being shared. */
            entityId: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /** @description Type of resource made available by the share. */
            shareType: number;
            /** @description URL slug used to access the resource. */
            slug: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getShareBySlug: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description URL slug used to access the resource. */
        slug: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            [key: string]: unknown;
          };
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getShare: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Identifier used to access a shared resource. */
        shareId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description ID of the resource being shared. */
            entityId: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /** @description Type of resource made available by the share. */
            shareType: number;
            /** @description URL slug used to access the resource. */
            slug: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updateShare: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Identifier used to access a shared resource. */
        shareId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          /** @description URL slug used to access the resource. */
          slug: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description ID of the resource being shared. */
            entityId: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /** @description Type of resource made available by the share. */
            shareType: number;
            /** @description URL slug used to access the resource. */
            slug: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteShare: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Identifier used to access a shared resource. */
        shareId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getTeams: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /** @description Code used to join the team. */
              accessCode: string;
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description URL of the logo image. */
              logoUrl: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Whether two-factor authentication is required. */
              twoFactorRequired: boolean;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createTeam: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Display name of the resource. */
          name: string;
          /** Format: uuid */
          ownerId?: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': [
            {
              /** @description Code used to join the team. */
              accessCode: string;
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description URL of the logo image. */
              logoUrl: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Whether two-factor authentication is required. */
              twoFactorRequired: boolean;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
            },
            {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Permission role assigned to the user. */
              role: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            },
          ];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getTeam: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated team. */
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Code used to join the team. */
            accessCode: string;
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Date and time the record was deleted, if applicable.
             */
            deletedAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description URL of the logo image. */
            logoUrl: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Whether two-factor authentication is required. */
            twoFactorRequired: boolean;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updateTeam: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated team. */
        teamId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Code used to join the team. */
          accessCode?: string;
          /** @description Display name of the resource. */
          name?: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Code used to join the team. */
            accessCode: string;
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Date and time the record was deleted, if applicable.
             */
            deletedAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description URL of the logo image. */
            logoUrl: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Whether two-factor authentication is required. */
            twoFactorRequired: boolean;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteTeam: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated team. */
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getTeamBoards: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path: {
        /** @description ID of the associated team. */
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Description of the resource. */
              description: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Configuration parameters for the resource. */
              parameters:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              /** @description ID of the associated team. */
              teamId: string;
              type: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getTeamLinks: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path: {
        /** @description ID of the associated team. */
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description URL slug used to access the resource. */
              slug: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description URL associated with the resource. */
              url: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getTeamPixels: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path: {
        /** @description ID of the associated team. */
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description URL slug used to access the resource. */
              slug: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getTeamUsers: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
      };
      header?: never;
      path: {
        /** @description ID of the associated team. */
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: ({
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Permission role assigned to the user. */
              role: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            } & {
              /** @description User associated with the resource. */
              user?: {
                /** @description Unique identifier of the resource. */
                id: string;
                /** @description Username of the account. */
                username: string;
              };
            })[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createTeamUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated team. */
        teamId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /**
           * @description Permission role assigned to the user.
           * @enum {string}
           */
          role: 'team-member' | 'team-view-only' | 'team-manager';
          /**
           * Format: uuid
           * @description ID of the associated user.
           */
          userId: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Permission role assigned to the user. */
            role: string;
            /** @description ID of the associated team. */
            teamId: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getTeamUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated team. */
        teamId: string;
        /** @description ID of the associated user. */
        userId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Permission role assigned to the user. */
            role: string;
            /** @description ID of the associated team. */
            teamId: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updateTeamUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated team. */
        teamId: string;
        /** @description ID of the associated user. */
        userId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /**
           * @description Permission role assigned to the user.
           * @enum {string}
           */
          role: 'team-member' | 'team-view-only' | 'team-manager';
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Permission role assigned to the user. */
            role: string;
            /** @description ID of the associated team. */
            teamId: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteTeamUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated team. */
        teamId: string;
        /** @description ID of the associated user. */
        userId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getTeamWebsites: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path: {
        /** @description ID of the associated team. */
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: ({
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description ID of the user who created the resource. */
              createdBy: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Domain name associated with the resource. */
              domain: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Whether recording is enabled for the website. */
              recorderEnabled: boolean;
              /** @description Session replay and heatmap recording configuration. */
              replayConfig:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              /**
               * Format: date-time
               * @description Date and time the website analytics were last reset.
               */
              resetAt: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            } & {
              /** @description User who created the resource. */
              createUser?: {
                /** @description Unique identifier of the resource. */
                id: string;
                /** @description Username of the account. */
                username: string;
              };
              /** @description Identifier used to access a shared resource. */
              shareId: string;
              /** @description Team associated with the resource. */
              team?: {
                /** @description Members of the team. */
                members: {
                  /** @description Permission role assigned to the user. */
                  role: string;
                  /** @description ID of the associated user. */
                  userId: string;
                }[];
              };
              /** @description User associated with the resource. */
              user?: {
                /** @description Unique identifier of the resource. */
                id: string;
                /** @description Username of the account. */
                username: string;
              };
            })[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  joinTeam: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Code used to join the team. */
          accessCode: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Permission role assigned to the user. */
            role: string;
            /** @description ID of the associated team. */
            teamId: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createUser: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /**
           * Format: uuid
           * @description Unique identifier of the resource.
           */
          id?: string;
          /** @description Password used to authenticate the account. */
          password: string;
          /**
           * @description Permission role assigned to the user.
           * @enum {string}
           */
          role: 'admin' | 'user' | 'view-only';
          /** @description Username of the account. */
          username: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Permission role assigned to the user. */
            role: string;
            /** @description Username of the account. */
            username: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated user. */
        userId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            _count: {
              /** @description API keys associated with the user. */
              apiKeys: number;
              /** @description Boards associated with the user. */
              boards: number;
              /** @description ID of the user who created the resource. */
              createdBy: number;
              /** @description Tracked links associated with the user. */
              links: number;
              /** @description Tracking pixels associated with the user. */
              pixels: number;
              /** @description Saved reports associated with the user. */
              reports: number;
              /** @description Teams associated with the user. */
              teams: number;
              twoFactorAuth: number;
              twoFactorBackupCodes: number;
              twoFactorOtpUseds: number;
              twoFactorRateLimit: number;
              websites: number;
            };
            /** @description API keys associated with the user. */
            apiKeys: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              keyHash: string;
              /** @description Visible prefix used to identify an API key. */
              keyPrefix: string;
              /**
               * Format: date-time
               * @description Date and time the credential was last used.
               */
              lastUsedAt: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            /** @description Boards associated with the user. */
            boards: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Description of the resource. */
              description: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Configuration parameters for the resource. */
              parameters:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              /** @description ID of the associated team. */
              teamId: string;
              type: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description ID of the user who created the resource. */
            createdBy: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description ID of the user who created the resource. */
              createdBy: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Domain name associated with the resource. */
              domain: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Whether recording is enabled for the website. */
              recorderEnabled: boolean;
              /** @description Session replay and heatmap recording configuration. */
              replayConfig:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              /**
               * Format: date-time
               * @description Date and time the website analytics were last reset.
               */
              resetAt: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Tracked links associated with the user. */
            links: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description URL slug used to access the resource. */
              slug: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description URL associated with the resource. */
              url: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            /** @description Password used to authenticate the account. */
            password: string;
            /** @description Tracking pixels associated with the user. */
            pixels: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description URL slug used to access the resource. */
              slug: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            /** @description Saved reports associated with the user. */
            reports: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Description of the resource. */
              description: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Configuration parameters for the resource. */
              parameters:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              type: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
              /** @description ID of the website. */
              websiteId: string;
            }[];
            /** @description Permission role assigned to the user. */
            role: string;
            /** @description Teams associated with the user. */
            teams: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Permission role assigned to the user. */
              role: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            twoFactorAuth: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Whether two-factor authentication is enabled. */
              isEnabled: boolean;
              secret: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            };
            twoFactorBackupCodes: {
              codeHash: string;
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              used: boolean;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            twoFactorOtpUseds: {
              /**
               * Format: date-time
               * @description Date and time the credential expires.
               */
              expiresAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              otp: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
            twoFactorRateLimit: {
              attempts: number;
              /** @description Unique identifier of the resource. */
              id: string;
              /**
               * Format: date-time
               * @description Time until which further authentication attempts are blocked.
               */
              lockedUntil: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            };
            /** @description Whether two-factor authentication is required. */
            twoFactorRequired: boolean;
            /** @description Username of the account. */
            username: string;
            websites: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description ID of the user who created the resource. */
              createdBy: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Domain name associated with the resource. */
              domain: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Whether recording is enabled for the website. */
              recorderEnabled: boolean;
              /** @description Session replay and heatmap recording configuration. */
              replayConfig:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              /**
               * Format: date-time
               * @description Date and time the website analytics were last reset.
               */
              resetAt: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            }[];
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updateUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated user. */
        userId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Password used to authenticate the account. */
          password?: string;
          /**
           * @description Permission role assigned to the user.
           * @enum {string}
           */
          role?: 'admin' | 'user' | 'view-only';
          /** @description Username of the account. */
          username?: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Permission role assigned to the user. */
            role: string;
            /** @description Username of the account. */
            username: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the associated user. */
        userId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getUserTeams: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path: {
        /** @description ID of the associated user. */
        userId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /** @description Code used to join the team. */
              accessCode: string;
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description URL of the logo image. */
              logoUrl: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Whether two-factor authentication is required. */
              twoFactorRequired: boolean;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getUserWebsites: {
    parameters: {
      query?: {
        /** @description Set a non-empty value to include websites accessible through team membership. */
        includeTeams?: string;
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path: {
        /** @description ID of the associated user. */
        userId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: ({
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description ID of the user who created the resource. */
              createdBy: string;
              /**
               * Format: date-time
               * @description Date and time the record was deleted, if applicable.
               */
              deletedAt: string;
              /** @description Domain name associated with the resource. */
              domain: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Whether recording is enabled for the website. */
              recorderEnabled: boolean;
              /** @description Session replay and heatmap recording configuration. */
              replayConfig:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              /**
               * Format: date-time
               * @description Date and time the website analytics were last reset.
               */
              resetAt: string;
              /** @description ID of the associated team. */
              teamId: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
            } & {
              /** @description User who created the resource. */
              createUser?: {
                /** @description Unique identifier of the resource. */
                id: string;
                /** @description Username of the account. */
                username: string;
              };
              /** @description Identifier used to access a shared resource. */
              shareId: string;
              /** @description Team associated with the resource. */
              team?: {
                /** @description Members of the team. */
                members: {
                  /** @description Permission role assigned to the user. */
                  role: string;
                  /** @description ID of the associated user. */
                  userId: string;
                }[];
              };
              /** @description User associated with the resource. */
              user?: {
                /** @description Unique identifier of the resource. */
                id: string;
                /** @description Username of the account. */
                username: string;
              };
            })[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  listWebsites: {
    parameters: {
      query?: {
        /** @description When present, include websites accessible through owned or managed teams. */
        includeTeams?: string;
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Field to sort the results by. */
        orderBy?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Whether to sort results in descending order. */
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description A page of websites. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['WebsitePage'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createWebsite: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateWebsiteRequest'];
      };
    };
    responses: {
      /** @description Website created. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Website'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsite: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Website ID. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Website details, or null if it does not exist. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Website'] | null;
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updateWebsite: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Website ID. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateWebsiteRequest'];
      };
    };
    responses: {
      /** @description Website updated. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Website'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Server error. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "server-error",
           *         "message": "Server error.",
           *         "status": 500
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteWebsite: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Website ID. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Website deleted. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Ok'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteActive: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Website ID. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Active visitor count. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ActiveVisitors'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteAnnotations: {
    parameters: {
      query?: {
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /** @description Whether the annotation applies to the entire day. */
              allDay: boolean;
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** Format: date-time */
              date: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Text of the annotation. */
              note: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
              /** @description ID of the website. */
              websiteId: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createWebsiteAnnotation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Whether the annotation applies to the entire day. */
          allDay?: boolean;
          /** Format: date-time */
          date: string;
          /** @description Text of the annotation. */
          note: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Whether the annotation applies to the entire day. */
            allDay: boolean;
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** Format: date-time */
            date: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Text of the annotation. */
            note: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
            /** @description ID of the website. */
            websiteId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteAnnotation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the annotation. */
        annotationId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Whether the annotation applies to the entire day. */
            allDay: boolean;
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** Format: date-time */
            date: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Text of the annotation. */
            note: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
            /** @description ID of the website. */
            websiteId: string;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updateWebsiteAnnotation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the annotation. */
        annotationId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Whether the annotation applies to the entire day. */
          allDay?: boolean;
          /** Format: date-time */
          date: string;
          /** @description Text of the annotation. */
          note: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Whether the annotation applies to the entire day. */
            allDay: boolean;
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** Format: date-time */
            date: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Text of the annotation. */
            note: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
            /** @description ID of the website. */
            websiteId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteWebsiteAnnotation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the annotation. */
        annotationId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteAttribution: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Currency code used for revenue values. */
        currency?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        model: 'first-click' | 'last-click';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        step: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Type of resource or analytics dimension to return. */
        type: 'path' | 'event';
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            paidAds: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            /** @description URL of the referring page. */
            referrer: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            total: {
              /** @description Pageview counts for the selected period. */
              pageviews: number;
              /** @description Unique visitor counts for the selected period. */
              visitors: number;
              /** @description Visit counts for the selected period. */
              visits: number;
            };
            utm_campaign: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            utm_content: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            utm_medium: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            utm_source: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
            utm_term: {
              /** @description Display name of the resource. */
              name: string;
              value: number;
            }[];
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteBreakdown: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        fields: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': ({
            /** @description Number of visits with only one pageview. */
            bounces: number;
            /** @description Total visit duration in seconds. */
            totaltime: number;
            /** @description Pageview counts for the selected period. */
            views: number;
            /** @description Unique visitor counts for the selected period. */
            visitors: number;
            /** @description Visit counts for the selected period. */
            visits: number;
          } & {
            [key: string]: string | number;
          })[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteDateRange: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description End of the date range as an ISO 8601 date or date-time.
             */
            endDate: string;
            /**
             * Format: date-time
             * @description Start of the date range as an ISO 8601 date or date-time.
             */
            startDate: string;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getEventData: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /** @description ID of the event. */
              eventId: string;
              /** @description Name of the custom event. */
              eventName: string;
              /** @description Custom properties recorded with the event. */
              eventProperties: {
                /** @description Date and time the record was created. */
                createdAt: string;
                /** @description Name of the custom property. */
                dataKey: string;
                /** @description Data type of the custom property. */
                dataType: number;
                /** @description Custom property value stored as a date-time. */
                dateValue: string;
                /** @description Custom property value stored as a number. */
                numberValue: number;
                /** @description Custom property value stored as a string. */
                stringValue: string;
              }[];
              /** @description ID of the website. */
              websiteId: string;
            }[];
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getEventDataPivot: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Name of the custom event. */
        eventName: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /** @description Date and time the record was created. */
              createdAt: string;
              /** @description ID of the event. */
              eventId: string;
              /** @description Name of the custom event. */
              eventName: string;
              /** @description Names of the custom properties. */
              propertyKeys: string[];
              /** @description Values of the custom properties. */
              propertyValues: string[];
              /** @description ID of the visitor session. */
              sessionId: string;
              /** @description Path portion of the page URL. */
              urlPath: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getEventDataArraySeries: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Name of the custom event. */
        eventName: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            t: string;
            x: string;
            y: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getEventDataDateSeries: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Name of the custom event. */
        eventName: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            t: string;
            y: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getEventDataNumericSeries: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Name of the custom event. */
        eventName: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Numeric aggregation to calculate for the selected property. */
        metric?: 'sum' | 'avg' | 'count';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            t: string;
            y: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getEventDataNumericStats: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Name of the custom event. */
        eventName: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Arithmetic mean of the numeric property values. */
            average: number;
            /** @description Maximum numeric property value. */
            max: number;
            /** @description Median of the numeric property values. */
            median: number;
            /** @description Minimum numeric property value. */
            min: number;
            total: number;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getEventDataPropertySeries: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Name of the custom event. */
        eventName: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            t: string;
            x: string;
            y: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getEventDataById: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the event. */
        eventId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Name of the custom property. */
            dataKey: string;
            /** @description Data type of the custom property. */
            dataType: number;
            /**
             * Format: date-time
             * @description Custom property value stored as a date-time.
             */
            dateValue: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Custom property value stored as a number. */
            numberValue: {
              d: number[];
              e: number;
              s: number;
            };
            /** @description Custom property value stored as a string. */
            stringValue: string;
            /** @description ID of the website event. */
            websiteEventId: string;
            /** @description ID of the website. */
            websiteId: string;
          }[];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getEventDataEvents: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Data type of the custom property. */
            dataType: number;
            /** @description Name of the custom event. */
            eventName?: string;
            /** @description Name of the custom event or session property. */
            propertyName: string;
            /** @description Value of the custom property. */
            propertyValue?: string;
            total: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getEventDataFields: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Name of the custom event. */
        eventName?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Data type of the custom property. */
            dataType: number;
            /** @description Name of the custom event or session property. */
            propertyName: string;
            total: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getEventDataProperties: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Data type of the custom property. */
            dataType: number;
            /** @description Name of the custom event. */
            eventName: string;
            /** @description Name of the custom event or session property. */
            propertyName: string;
            total: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getEventDataStats: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            events: number;
            properties: number;
            records: number;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getEventDataValues: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Data type of the custom property. */
        dataType?: number;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Name of the custom event. */
        eventName?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            total: number;
            value: string;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteEvents: {
    parameters: {
      query?: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description Website ID. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description A page of events. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['WebsiteEventPage'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteEventSeries: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Maximum number of rows to return. */
        limit?: number;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            t: string;
            x: string;
            y: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteEventStats: {
    parameters: {
      query?: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Data returned by the operation. */
            data: {
              /** @description Analytics for the comparison period. */
              comparison: {
                events: number;
                /** @description Number of unique events. */
                uniqueEvents: number;
                /** @description Unique visitor counts for the selected period. */
                visitors: number;
                /** @description Visit counts for the selected period. */
                visits: number;
              }[];
              length: number;
            };
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  exportWebsite: {
    parameters: {
      query?: {
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            zip: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Successful response. The response shape is inferred as free-form because the handler does not expose a reusable response schema. */
      'function toString() { [native code] }': {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': unknown;
        };
      };
    };
  };
  getWebsiteFunnels: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: ({
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Description of the resource. */
              description: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Configuration parameters for the resource. */
              parameters:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              type: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
              /** @description ID of the website. */
              websiteId: string;
            } & {
              website?: {
                /** @description Domain name associated with the resource. */
                domain: string;
                /** @description ID of the associated user. */
                userId: string;
              };
            })[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createWebsiteFunnel: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Description of the resource. */
          description?: string;
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters: {
            steps: {
              /** @description Filters applied to the analytics data. */
              filters?: {
                /** @enum {string} */
                operator: 'eq' | 'neq' | 'c' | 'dnc';
                property: string;
                value: string;
              }[];
              /** @enum {string} */
              type: 'path' | 'event';
              value: string;
            }[];
            window: number;
          };
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteFunnel: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        funnelId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updateWebsiteFunnel: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        funnelId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Description of the resource. */
          description?: string;
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters: {
            steps: {
              /** @description Filters applied to the analytics data. */
              filters?: {
                /** @enum {string} */
                operator: 'eq' | 'neq' | 'c' | 'dnc';
                property: string;
                value: string;
              }[];
              /** @enum {string} */
              type: 'path' | 'event';
              value: string;
            }[];
            window: number;
          };
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteWebsiteFunnel: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        funnelId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Deleted successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Ok'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteSavedFunnelStats: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        funnelId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            dropoff: number;
            dropped: number;
            /** @description Filters applied to the analytics data. */
            filters?: {
              operator: string;
              property: string;
              value: string;
            }[];
            previous: number;
            remaining: number;
            type: string;
            value: string;
            /** @description Unique visitor counts for the selected period. */
            visitors: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteFunnelStats: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        steps: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
        window: number;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            dropoff: number;
            dropped: number;
            /** @description Filters applied to the analytics data. */
            filters?: {
              operator: string;
              property: string;
              value: string;
            }[];
            previous: number;
            remaining: number;
            type: string;
            value: string;
            /** @description Unique visitor counts for the selected period. */
            visitors: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteGoals: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: ({
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Description of the resource. */
              description: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Configuration parameters for the resource. */
              parameters:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              type: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
              /** @description ID of the website. */
              websiteId: string;
            } & {
              website?: {
                /** @description Domain name associated with the resource. */
                domain: string;
                /** @description ID of the associated user. */
                userId: string;
              };
            })[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createWebsiteGoal: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Description of the resource. */
          description?: string;
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters: {
            type: string;
            value: string;
          };
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteGoal: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        goalId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updateWebsiteGoal: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        goalId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Description of the resource. */
          description?: string;
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters: {
            type: string;
            value: string;
          };
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteWebsiteGoal: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        goalId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Deleted successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Ok'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteSavedGoalStats: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        goalId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            num: number;
            total: number;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteGoalStats: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Type of resource or analytics dimension to return. */
        type: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
        value: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            num: number;
            total: number;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteHeatmaps: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        mode?: 'click' | 'scroll';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description Path portion of the page URL. */
        urlPath?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            mode: 'click' | 'scroll';
            pages: {
              /** @description Number of matching records. */
              count: number;
              sessions: number;
              /** @description Path portion of the page URL. */
              urlPath: string;
            }[];
            points: {
              /** @description Number of matching records. */
              count: number;
              /** @description Page height in pixels. */
              pageH: number;
              /** @description Page width in pixels. */
              pageW: number;
              /** @description Horizontal position on the page in pixels. */
              pageX: number;
              /** @description Vertical position on the page in pixels. */
              pageY: number;
              /** @description Viewport height in pixels. */
              viewportH: number;
              /** @description Viewport width in pixels. */
              viewportW: number;
              x: number;
              y: number;
            }[];
            scroll: {
              buckets: {
                depth: number;
                /** @description Page height in pixels. */
                pageH: number;
                /** @description Page width in pixels. */
                pageW: number;
                sessions: number;
                /** @description Viewport height in pixels. */
                viewportH: number;
                /** @description Viewport width in pixels. */
                viewportW: number;
              }[];
              /** @description Page height in pixels. */
              pageH: number;
              /** @description Page width in pixels. */
              pageW: number;
              totalSessions: number;
              /** @description Viewport height in pixels. */
              viewportH: number;
              /** @description Viewport width in pixels. */
              viewportW: number;
            };
            snapshot: {
              /** @description Unique identifier of the resource. */
              id: string;
              /** @constant */
              kind: 'iframe';
              /** @description Page height in pixels. */
              pageH: number;
              /** @description Page width in pixels. */
              pageW: number;
              /** @description URL associated with the resource. */
              url: string;
              /** @description Viewport height in pixels. */
              viewportH: number;
              /** @description Viewport width in pixels. */
              viewportW: number;
            };
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteJourneys: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        endStep?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        startStep?: string;
        steps: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Analytics results. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            items: string[];
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteMetrics: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Maximum number of rows to return. */
        limit?: number;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Number of rows to skip before returning results. */
        offset?: number;
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Dimension to rank: path, entry, exit, title, query, hostname, referrer, domain, channel, event, tag, browser, os, device, screen, language, country, region, city, distinctId, utmSource, utmMedium, utmCampaign, utmContent, utmTerm. */
        type: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description Website ID. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Ranked rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MetricRows'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteExpandedMetrics: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Maximum number of rows to return. */
        limit?: number;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Number of rows to skip before returning results. */
        offset?: number;
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Type of resource or analytics dimension to return. */
        type: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of visits with only one pageview. */
            bounces: number;
            /** @description Display name of the resource. */
            name: string;
            /** @description Pageview counts for the selected period. */
            pageviews: number;
            /** @description Total visit duration in seconds. */
            totaltime: number;
            /** @description Unique visitor counts for the selected period. */
            visitors: number;
            /** @description Visit counts for the selected period. */
            visits: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsitePageviews: {
    parameters: {
      query?: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description Website ID. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Time series. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['WebsitePageviews'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsitePerformanceChart: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Numeric aggregation to calculate for the selected property. */
        metric?: 'lcp' | 'inp' | 'cls' | 'fcp' | 'ttfb';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Analytics results. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            chart: {
              p50: number;
              p75: number;
              p95: number;
              t: string;
            }[];
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsitePerformanceMetrics: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Maximum number of rows to return. */
        limit?: number;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Numeric aggregation to calculate for the selected property. */
        metric?: 'lcp' | 'inp' | 'cls' | 'fcp' | 'ttfb';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Type of resource or analytics dimension to return. */
        type: 'path' | 'title' | 'device' | 'browser';
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Analytics results. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Display name of the resource. */
            name: string;
            p50: number;
            p75: number;
            p95: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsitePerformanceStats: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Analytics results. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            cls: {
              p50: number;
              p75: number;
              p95: number;
            };
            /** @description Number of matching records. */
            count: number;
            fcp: {
              p50: number;
              p75: number;
              p95: number;
            };
            inp: {
              p50: number;
              p75: number;
              p95: number;
            };
            lcp: {
              p50: number;
              p75: number;
              p95: number;
            };
            ttfb: {
              p50: number;
              p75: number;
              p95: number;
            };
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteRecorderConfig: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                enabled: boolean;
              }
            | {
                /** @description CSS selector for elements excluded from recordings. */
                blockSelector: string;
                enabled: boolean;
                /** @description Whether heatmap recording is enabled. */
                heatmapEnabled: boolean;
                /** @description Fraction of sessions to record for heatmaps, from 0 to 1. */
                heatmapSampleRate: number;
                /** @description Privacy masking level used by the recorder: strict or moderate. */
                maskLevel: 'strict' | 'moderate';
                maxDuration: number;
                /** @description Whether session replay recording is enabled. */
                replayEnabled: boolean;
                /** @description Fraction of sessions to record for replay, from 0 to 1. */
                sampleRate: number;
              };
        };
      };
    };
  };
  getWebsiteReplays: {
    parameters: {
      query?: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Minimum replay duration in seconds. */
        minDuration?: number;
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /** @description Browser used by the visitor. */
              browser: string;
              /** @description Number of stored recording chunks. */
              chunkCount: number;
              /** @description City of the visitor. */
              city: string;
              /** @description Country code of the visitor. */
              country: string;
              /** @description Date and time the record was created. */
              createdAt: string;
              /** @description Device category used by the visitor. */
              device: string;
              /** @description Replay duration in milliseconds. */
              duration: number;
              /** @description Date and time the recording ended. */
              endedAt: string;
              /** @description Number of recorded replay events. */
              eventCount: number;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Operating system used by the visitor. */
              os: string;
              /** @description ID of the visitor session. */
              sessionId: string;
              /** @description Date and time the recording started. */
              startedAt: string;
              /** @description ID of the website. */
              websiteId: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteReplay: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the session replay. */
        replayId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of stored recording chunks. */
            chunkCount: number;
            /**
             * Format: date-time
             * @description Date and time the recording ended.
             */
            endedAt: string;
            /** @description Number of recorded replay events. */
            eventCount: number;
            events: unknown[];
            /** @description ID of the visitor session. */
            sessionId: string;
            /**
             * Format: date-time
             * @description Date and time the recording started.
             */
            startedAt: string;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteSavedReplays: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the visit. */
              visitId: string;
              /** @description ID of the website. */
              websiteId: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteReplaySaved: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the session replay. */
        replayId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Whether the replay has been saved. */
            isSaved: boolean;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  saveWebsiteReplay: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the session replay. */
        replayId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Whether the replay has been saved. */
          isSaved: boolean;
          /** @description Display name of the resource. */
          name?: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Whether the operation succeeded. */
            ok: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteReports: {
    parameters: {
      query?: {
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Type of resource or analytics dimension to return. */
        type?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: ({
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Description of the resource. */
              description: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Configuration parameters for the resource. */
              parameters:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              type: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the associated user. */
              userId: string;
              /** @description ID of the website. */
              websiteId: string;
            } & {
              website?: {
                /** @description Domain name associated with the resource. */
                domain: string;
                /** @description ID of the associated user. */
                userId: string;
              };
            })[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  resetWebsite: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteRetention: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            date: string;
            day: number;
            percentage: number;
            returnVisitors: number;
            /** @description Unique visitor counts for the selected period. */
            visitors: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteRevenueChart: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Currency code used for revenue values. */
        currency: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            chart: {
              /** @description Number of matching records. */
              count: number;
              t: string;
              x: string;
              y: number;
            }[];
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteRevenueMetrics: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Currency code used for revenue values. */
        currency: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Type of resource or analytics dimension to return. */
        type: 'country' | 'region' | 'referrer' | 'channel';
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @description Display name of the resource. */
                name: string;
                value: number;
              }[]
            | {
                /** @description Country code of the visitor. */
                country: string;
                /** @description Display name of the resource. */
                name: string;
                value: number;
              }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteRevenueSessions: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Currency code used for revenue values. */
        currency: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /** @description Browser used by the visitor. */
              browser: string;
              /** @description City of the visitor. */
              city: string;
              /** @description Country code of the visitor. */
              country: string;
              /** @description Date and time the record was created. */
              createdAt: string;
              /** @description Device category used by the visitor. */
              device: string;
              events: number;
              /** @description Date and time of the first recorded activity. */
              firstAt: string;
              /** @description Hostname on which the activity occurred. */
              hostname: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Preferred language reported by the visitor browser. */
              language: string;
              /** @description Date and time of the most recent recorded activity. */
              lastAt: string;
              /** @description Operating system used by the visitor. */
              os: string;
              /** @description Region or subdivision of the visitor. */
              region: string;
              /** @description Screen resolution of the visitor device. */
              screen: string;
              /** @description Pageview counts for the selected period. */
              views: number;
              /** @description Visit counts for the selected period. */
              visits: number;
              /** @description ID of the website. */
              websiteId: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteRevenueStats: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Currency code used for revenue values. */
        currency: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Analytics for the comparison period. */
            comparison: unknown;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteSegments: {
    parameters: {
      query: {
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Type of resource or analytics dimension to return. */
        type: 'segment' | 'cohort';
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Configuration parameters for the resource. */
              parameters:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              type: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
              /** @description ID of the website. */
              websiteId: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createWebsiteSegment: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters: {
            action?: {
              type: string;
              value: string;
            };
            dateRange?: string;
            /** @description Filters applied to the analytics data. */
            filters?: {
              [key: string]: unknown;
            }[];
            /**
             * @description Whether records must match all filters or any filter.
             * @enum {string}
             */
            match?: 'all' | 'any';
          };
          /** @enum {string} */
          type: 'segment' | 'cohort';
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            type: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the website. */
            websiteId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteSegment: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the saved segment or cohort. */
        segmentId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            type: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the website. */
            websiteId: string;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  updateWebsiteSegment: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the saved segment or cohort. */
        segmentId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters: {
            [key: string]: unknown;
          };
          /** @enum {string} */
          type: 'segment' | 'cohort';
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            type: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the website. */
            websiteId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteWebsiteSegment: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the saved segment or cohort. */
        segmentId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getSessionDataPivot: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /** @description Date and time the record was created. */
              createdAt: string;
              /** @description Custom identifier assigned to the visitor. */
              distinctId: string;
              /** @description Names of the custom properties. */
              propertyKeys: string[];
              /** @description Values of the custom properties. */
              propertyValues: string[];
              /** @description ID of the visitor session. */
              sessionId: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getSessionDataArraySeries: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            t: string;
            x: string;
            y: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getSessionDataDateSeries: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            t: string;
            y: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getSessionDataNumericSeries: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Numeric aggregation to calculate for the selected property. */
        metric?: 'sum' | 'avg' | 'count';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            t: string;
            y: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getSessionDataNumericStats: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Arithmetic mean of the numeric property values. */
            average: number;
            /** @description Maximum numeric property value. */
            max: number;
            /** @description Median of the numeric property values. */
            median: number;
            /** @description Minimum numeric property value. */
            min: number;
            total: number;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getSessionDataProperties: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Data type of the custom property. */
            dataType: number;
            /** @description Name of the custom event or session property. */
            propertyName: string;
            total: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getSessionDataPropertySeries: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            t: string;
            x: string;
            y: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getSessionDataStats: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            activity: number;
            events: number;
            label: string;
            sessions: number;
            /** @description Pageview counts for the selected period. */
            views: number;
            /** @description Visit counts for the selected period. */
            visits: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getSessionDataValues: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Data type of the custom property. */
        dataType?: number;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Name of the custom event or session property. */
        propertyName?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            total: number;
            value: string;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteSessions: {
    parameters: {
      query?: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description Website ID. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description A page of sessions. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['WebsiteSessionPage'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteSession: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the visitor session. */
        sessionId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            canDelete: unknown;
            stitchedSessionCount: unknown;
          };
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  deleteWebsiteSession: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the visitor session. */
        sessionId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * @description Whether the operation succeeded.
             * @constant
             */
            ok: true;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteSessionActivity: {
    parameters: {
      query: {
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
      };
      header?: never;
      path: {
        /** @description ID of the visitor session. */
        sessionId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Date and time the record was created. */
            createdAt: string;
            /** @description ID of the event. */
            eventId: string;
            /** @description Name of the custom event. */
            eventName: string;
            /** @description Event type: 1 for a pageview or 2 for a custom event. */
            eventType: number;
            hasData: boolean;
            /** @description Hostname on which the activity occurred. */
            hostname: string;
            /** @description Domain of the referring page. */
            referrerDomain: string;
            /** @description Path portion of the page URL. */
            urlPath: string;
            /** @description Query string portion of the page URL. */
            urlQuery: string;
            /** @description ID of the visit. */
            visitId: string;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteSessionProperties: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the visitor session. */
        sessionId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Date and time the record was created. */
            createdAt: string;
            /** @description Name of the custom property. */
            dataKey: string;
            /** @description Data type of the custom property. */
            dataType: number;
            /** @description Custom property value stored as a date-time. */
            dateValue: string;
            /** @description Custom property value stored as a number. */
            numberValue: number;
            /** @description ID of the visitor session. */
            sessionId: string;
            /** @description Custom property value stored as a string. */
            stringValue: string;
            /** @description ID of the website. */
            websiteId: string;
          }[];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteSessionReplays: {
    parameters: {
      query?: {
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
      };
      header?: never;
      path: {
        /** @description ID of the visitor session. */
        sessionId: string;
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /** @description Browser used by the visitor. */
              browser: string;
              /** @description Number of stored recording chunks. */
              chunkCount: number;
              /** @description City of the visitor. */
              city: string;
              /** @description Country code of the visitor. */
              country: string;
              /** @description Date and time the record was created. */
              createdAt: string;
              /** @description Device category used by the visitor. */
              device: string;
              /** @description Replay duration in milliseconds. */
              duration: number;
              /** @description Date and time the recording ended. */
              endedAt: string;
              /** @description Number of recorded replay events. */
              eventCount: number;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Operating system used by the visitor. */
              os: string;
              /** @description ID of the visitor session. */
              sessionId: string;
              /** @description Date and time the recording started. */
              startedAt: string;
              /** @description ID of the website. */
              websiteId: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteSessionStats: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': Record<string, never>;
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteSessionsWeekly: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': number[][];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteShares: {
    parameters: {
      query?: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Maximum number of results to include. */
        maxResults?: number;
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Page number, starting at 1. */
        page?: number;
        /** @description Number of results per page. */
        pageSize?: number;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Number of matching records. */
            count: number;
            /** @description Data returned by the operation. */
            data: {
              /**
               * Format: date-time
               * @description Date and time the record was created.
               */
              createdAt: string;
              /** @description ID of the resource being shared. */
              entityId: string;
              /** @description Unique identifier of the resource. */
              id: string;
              /** @description Display name of the resource. */
              name: string;
              /** @description Configuration parameters for the resource. */
              parameters:
                | string
                | number
                | false
                | true
                | {
                    [key: string]:
                      | string
                      | number
                      | false
                      | true
                      | unknown
                      | {
                          length: number;
                        };
                  }
                | {
                    length: number;
                  };
              /** @description Type of resource made available by the share. */
              shareType: number;
              /** @description URL slug used to access the resource. */
              slug: string;
              /**
               * Format: date-time
               * @description Date and time the record was last updated.
               */
              updatedAt: string;
            }[];
            /** @description Whether the results were truncated by the maximum result limit. */
            isCapped?: boolean;
            /** @description Field to sort the results by. */
            orderBy?: string;
            /** @description Page number, starting at 1. */
            page: number;
            /** @description Number of results per page. */
            pageSize: number;
            /** @description Search text used to filter results. */
            search?: string;
            /** @description Whether to sort results in descending order. */
            sortDescending?: boolean;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  createWebsiteShare: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Display name of the resource. */
          name: string;
          /** @description Configuration parameters for the resource. */
          parameters?: {
            [key: string]: unknown;
          };
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description ID of the resource being shared. */
            entityId: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Configuration parameters for the resource. */
            parameters:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /** @description Type of resource made available by the share. */
            shareType: number;
            /** @description URL slug used to access the resource. */
            slug: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteStats: {
    parameters: {
      query?: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description Website ID. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Summary stats with comparison. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['WebsiteStats'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  transferWebsite: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /**
           * Format: uuid
           * @description ID of the associated team.
           */
          teamId?: string;
          /**
           * Format: uuid
           * @description ID of the associated user.
           */
          userId?: string;
        };
      };
    };
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /**
             * Format: date-time
             * @description Date and time the record was created.
             */
            createdAt: string;
            /** @description ID of the user who created the resource. */
            createdBy: string;
            /**
             * Format: date-time
             * @description Date and time the record was deleted, if applicable.
             */
            deletedAt: string;
            /** @description Domain name associated with the resource. */
            domain: string;
            /** @description Unique identifier of the resource. */
            id: string;
            /** @description Display name of the resource. */
            name: string;
            /** @description Whether recording is enabled for the website. */
            recorderEnabled: boolean;
            /** @description Session replay and heatmap recording configuration. */
            replayConfig:
              | string
              | number
              | false
              | true
              | {
                  [key: string]:
                    | string
                    | number
                    | false
                    | true
                    | unknown
                    | {
                        length: number;
                      };
                }
              | {
                  length: number;
                };
            /**
             * Format: date-time
             * @description Date and time the website analytics were last reset.
             */
            resetAt: string;
            /** @description ID of the associated team. */
            teamId: string;
            /**
             * Format: date-time
             * @description Date and time the record was last updated.
             */
            updatedAt: string;
            /** @description ID of the associated user. */
            userId: string;
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteUtmMetrics: {
    parameters: {
      query: {
        /** @description Browser used by the visitor. */
        browser?: string;
        /** @description City of the visitor. */
        city?: string;
        /** @description ID of a saved cohort used to filter visitors. */
        cohort?: string;
        /** @description Country code of the visitor. */
        country?: string;
        /** @description Device category used by the visitor. */
        device?: string;
        /** @description Custom identifier assigned to the visitor. */
        distinctId?: string;
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt: number;
        /** @description Filter by custom event name. */
        event?: string;
        /** @description Event type: 1 for a pageview or 2 for a custom event. */
        eventType?: number;
        /** @description Set a non-empty value to exclude visits with only one pageview. */
        excludeBounce?: string;
        /** @description Hostname on which the activity occurred. */
        hostname?: string;
        /** @description Preferred language reported by the visitor browser. */
        language?: string;
        /** @description Whether records must match all filters or any filter. */
        match?: 'all' | 'any';
        /** @description Operating system used by the visitor. */
        os?: string;
        /** @description Filter by page URL path. */
        path?: string;
        /** @description Filter by page URL query string. */
        query?: string;
        /** @description Filter by referring URL. */
        referrer?: string;
        /** @description Region or subdivision of the visitor. */
        region?: string;
        /** @description ID of a saved segment used to filter results. */
        segment?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt: number;
        /** @description Tag attached to the tracked activity. */
        tag?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Filter by page title. */
        title?: string;
        /** @description Type of resource or analytics dimension to return. */
        type: 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content';
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
        /** @description UTM campaign name. */
        utmCampaign?: string;
        /** @description UTM campaign content. */
        utmContent?: string;
        /** @description UTM campaign medium. */
        utmMedium?: string;
        /** @description UTM campaign source. */
        utmSource?: string;
        /** @description UTM campaign search term. */
        utmTerm?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Analytics results. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            utm: string;
            /** @description Pageview counts for the selected period. */
            views: number;
          }[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "not-found",
           *         "message": "Not found.",
           *         "status": 404
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsiteValues: {
    parameters: {
      query: {
        /** @description Comparison period: prev for the previous period or yoy for the same period last year. */
        compare?: 'prev' | 'yoy';
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description End of the date range as an ISO 8601 date or date-time. */
        endDate?: string;
        /** @description Search text used to filter results. */
        search?: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description Start of the date range as an ISO 8601 date or date-time. */
        startDate?: string;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
        /** @description Type of resource or analytics dimension to return. */
        type: string;
        /** @description Time interval used to group results: minute, hour, day, month, or year. */
        unit?: string;
      };
      header?: never;
      path: {
        /** @description ID of the website. */
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': unknown[];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
  getWebsitesCharts: {
    parameters: {
      query: {
        /** @description End of the date range as a Unix timestamp in milliseconds. */
        endAt?: number;
        /** @description Comma-separated resource IDs. Provide between 1 and 20 IDs. */
        ids: string;
        /** @description Start of the date range as a Unix timestamp in milliseconds. */
        startAt?: number;
        /** @description IANA time zone used to interpret dates and group results, for example America/New_York. */
        timezone?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The operation completed successfully. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @description Data returned by the operation. */
            data: {
              [key: string]: {
                total: number;
                values: number[];
              };
            };
          };
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "bad-request",
           *         "message": "Bad request.",
           *         "status": 400
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
      /** @description Unauthorized. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "error": {
           *         "code": "unauthorized",
           *         "message": "Unauthorized.",
           *         "status": 401
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiError'];
        };
      };
    };
  };
}
