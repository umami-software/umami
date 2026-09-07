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
  '/api/oauth/authorize': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get OAuth authorization request details
     * @description Validates an OAuth authorization request and returns the client and requested permissions for the consent screen. Requires an interactive user session.
     */
    get: operations['describeOAuthAuthorization'];
    put?: never;
    /**
     * Approve or deny OAuth access
     * @description Records the user's consent decision and returns a redirect URL. Approval includes an authorization code, the request state, and the issuer.
     */
    post: operations['decideOAuthAuthorization'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/oauth/register': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Register an OAuth client
     * @description Registers a public OAuth client for clients that do not support Client ID Metadata Documents. Clients that support them should use an HTTPS metadata URL as their client ID.
     */
    post: operations['oauthRegisterClient'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/oauth/revoke': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Revoke an OAuth refresh token
     * @description Revokes the supplied refresh token. Unknown tokens are accepted without revealing whether they existed.
     */
    post: operations['oauthRevoke'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/oauth/token': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Get or refresh an OAuth access token
     * @description Exchanges an authorization code and PKCE verifier, or a refresh token, for an access token. Accepts form-encoded or JSON requests and rotates refresh tokens on use.
     */
    post: operations['oauthToken'];
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
      visitors: number;
    };
    /** @description Standard Umami API error response. */
    ApiError: {
      error: {
        code: string;
        message: string;
        status: number;
      } & {
        [key: string]: unknown;
      };
    };
    CreateWebsiteRequest: {
      domain: string;
      id?: string | null;
      name: string;
      shareId?: string | null;
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
          partialToken: string;
          /** @constant */
          requiresTwoFactor: true;
        }
      | {
          token: string;
          user: components['schemas']['LoginUser'];
        };
    LoginTeam: {
      /** Format: uuid */
      id: string;
      logoUrl: string | null;
      name: string;
    };
    LoginUser: {
      createdAt: string | null;
      /** Format: uuid */
      id: string;
      isAdmin: boolean;
      role: string;
      teams: components['schemas']['LoginTeam'][];
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
    OAuthAuthorizationDecision: {
      client_id: string;
      code_challenge?: string;
      code_challenge_method?: string;
      /** @enum {string} */
      decision: 'approve' | 'deny';
      redirect_uri?: string;
      resource?: string;
      response_type?: string;
      scope?: string;
      state?: string;
    };
    OAuthAuthorizationDetails: {
      client: {
        id: string;
        logoUri?: string;
        name: string;
        /** @enum {string} */
        source: 'metadata-document' | 'registered';
        uri?: string;
      };
      redirectUri: string;
      resource: string;
      scopes: {
        description: string;
        scope: string;
      }[];
    };
    OAuthAuthorizationRedirect: {
      redirectUrl: string;
    };
    OAuthClientRegistrationRequest: {
      /** @enum {string} */
      application_type?: 'web' | 'native';
      client_name: string;
      client_uri?: string;
      grant_types?: string[];
      logo_uri?: string;
      redirect_uris: string[];
      response_types?: string[];
      scope?: string;
      software_id?: string;
      software_version?: string;
      /** @constant */
      token_endpoint_auth_method?: 'none';
    };
    OAuthClientRegistrationResponse: {
      /** @enum {string} */
      application_type?: 'web' | 'native';
      client_id: string;
      client_id_issued_at: number;
      client_name: string;
      client_uri?: string;
      grant_types: string[];
      logo_uri?: string;
      redirect_uris: string[];
      response_types: string[];
      scope?: string;
      software_id?: string;
      software_version?: string;
      /** @constant */
      token_endpoint_auth_method: 'none';
    };
    OAuthErrorResponse: {
      error: string;
      error_description?: string;
    };
    OAuthRevocationRequest: {
      token: string;
      token_type_hint?: string;
    };
    OAuthTokenRequest: {
      client_id?: string;
      code?: string;
      code_verifier?: string;
      /** @enum {string} */
      grant_type: 'authorization_code' | 'refresh_token';
      redirect_uri?: string;
      refresh_token?: string;
      resource?: string;
      scope?: string;
    };
    OAuthTokenResponse: {
      access_token: string;
      expires_in: number;
      refresh_token: string;
      scope: string;
      /** @constant */
      token_type: 'Bearer';
    };
    /** @description Successful operation response. */
    Ok: {
      /** @constant */
      ok: true;
    };
    ReplayConfig: {
      blockSelector?: string;
      heatmapEnabled?: boolean;
      heatmapSampleRate?: number;
      /** @enum {string} */
      maskLevel?: 'strict' | 'moderate';
      maxDuration?: number;
      replayEnabled?: boolean;
      sampleRate?: number;
    } & {
      [key: string]: unknown;
    };
    ReplayConfigInput: {
      blockSelector?: string;
      heatmapEnabled?: boolean;
      heatmapSampleRate?: number;
      /** @enum {string} */
      maskLevel?: 'strict' | 'moderate';
      maxDuration?: number;
      replayEnabled?: boolean;
      sampleRate?: number;
    };
    TimeSeriesPoint: {
      /** @description Bucket start (ISO date/time). */
      x: string;
      /** @description Value for the bucket. */
      y: number;
    };
    UpdateWebsiteRequest: {
      domain?: string;
      name?: string;
      replayConfig?: components['schemas']['ReplayConfigInput'] | null;
      shareId?: string | null;
    };
    Website: {
      createdAt: string | null;
      createdBy: string | null;
      deletedAt: string | null;
      domain: string | null;
      /** Format: uuid */
      id: string;
      name: string;
      recorderEnabled: boolean;
      replayConfig: components['schemas']['ReplayConfig'] | null;
      resetAt: string | null;
      shareId: string | null;
      teamId: string | null;
      updatedAt: string | null;
      user?: components['schemas']['WebsiteUser'];
      userId: string | null;
    };
    WebsiteEvent: {
      /** Format: date-time */
      createdAt: string;
      distinctId?: string | null;
      eventName?: string | null;
      eventType: number;
      hostname?: string | null;
      /** Format: uuid */
      id: string;
      pageTitle?: string | null;
      referrerDomain?: string | null;
      /** Format: uuid */
      sessionId: string;
      urlPath?: string | null;
      urlQuery?: string | null;
      /** Format: uuid */
      websiteId: string;
    } & {
      [key: string]: unknown;
    };
    WebsiteEventPage: {
      count: number;
      data: components['schemas']['WebsiteEvent'][];
      isCapped?: boolean;
      page: number;
      pageSize: number;
    };
    WebsitePage: {
      count: number;
      data: components['schemas']['Website'][];
      orderBy?: string;
      page: number;
      pageSize: number;
      search?: string;
    };
    WebsitePageviews: {
      /** @description Present when `compare` was requested. */
      compare?: {
        /** Format: date-time */
        endDate: string;
        pageviews: components['schemas']['TimeSeriesPoint'][];
        sessions: components['schemas']['TimeSeriesPoint'][];
        /** Format: date-time */
        startDate: string;
      };
      /** Format: date-time */
      endDate?: string;
      pageviews: components['schemas']['TimeSeriesPoint'][];
      sessions: components['schemas']['TimeSeriesPoint'][];
      /** Format: date-time */
      startDate?: string;
    };
    WebsiteSession: {
      browser: string | null;
      city: string | null;
      country: string | null;
      /** Format: date-time */
      createdAt: string;
      device: string | null;
      distinctId?: string | null;
      events?: number;
      /** Format: date-time */
      firstAt: string;
      hostname: string | null;
      /** Format: uuid */
      id: string;
      language: string | null;
      /** Format: date-time */
      lastAt: string;
      os: string | null;
      region: string | null;
      screen: string | null;
      views: number;
      visits: number;
      /** Format: uuid */
      websiteId: string;
    } & {
      [key: string]: unknown;
    };
    WebsiteSessionPage: {
      count: number;
      data: components['schemas']['WebsiteSession'][];
      isCapped?: boolean;
      page: number;
      pageSize: number;
    };
    WebsiteStats: {
      bounces: number;
      /** @description The same totals for the comparison period (previous period by default). */
      comparison: components['schemas']['WebsiteStatsValues'];
      pageviews: number;
      totaltime: number;
      visitors: number;
      visits: number;
    };
    WebsiteStatsValues: {
      bounces: number;
      pageviews: number;
      totaltime: number;
      visitors: number;
      visits: number;
    };
    WebsiteUser: {
      /** Format: uuid */
      id: string;
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
                error: {
                  code: string;
                  /** Format: date-time */
                  lockedUntil: string;
                  message: string;
                };
              }
            | {
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
            error: {
              code: string;
              /** Format: date-time */
              lockedUntil: string;
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
                error: {
                  code: string;
                  /** Format: date-time */
                  lockedUntil: string;
                  message: string;
                };
              }
            | {
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
            error: {
              code: string;
              /** Format: date-time */
              lockedUntil: string;
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
            manualKey: string;
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
                globalRequired: boolean;
                isConfigured: boolean;
                isEnabled: boolean;
                isRequired: boolean;
                requiredReason: null;
              }
            | {
                globalRequired: boolean;
                isConfigured: boolean;
                isEnabled: boolean;
                isRequired: boolean;
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
                error: {
                  code: string;
                  /** Format: date-time */
                  lockedUntil: string;
                  message: string;
                };
              }
            | {
                token: string;
                user: {
                  /** Format: date-time */
                  createdAt: string;
                  id: string;
                  isAdmin: boolean;
                  role: string;
                  teams: {
                    id: string;
                    logoUrl: string;
                    name: string;
                  }[];
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
            error: {
              code: string;
              /** Format: date-time */
              lockedUntil: string;
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
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
        search?: string;
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
            count: number;
            data: {
              accessCode: string;
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              deletedAt: string;
              id: string;
              logoUrl: string;
              name: string;
              twoFactorRequired: boolean;
              /** Format: date-time */
              updatedAt: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
            ok: boolean;
            teamId: string;
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
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
        search?: string;
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
            count: number;
            data: {
              _count?: {
                websites: number;
              };
              /** Format: date-time */
              createdAt: string;
              id: string;
              role: string;
              twoFactorRequired: boolean;
              username: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
            ok: boolean;
            twoFactorRequired: unknown;
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
            ok: boolean;
            reset: {
              backupCodes: unknown;
              otpUsed: unknown;
              rateLimit: unknown;
              twoFactorAuth: unknown;
            };
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
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
        search?: string;
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
            count: number;
            data: ({
              /** Format: date-time */
              createdAt: string;
              createdBy: string;
              /** Format: date-time */
              deletedAt: string;
              domain: string;
              id: string;
              name: string;
              recorderEnabled: boolean;
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
              /** Format: date-time */
              resetAt: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            } & {
              createUser?: {
                id: string;
                username: string;
              };
              shareId: string;
              team?: {
                members: {
                  role: string;
                  userId: string;
                }[];
              };
              user?: {
                id: string;
                username: string;
              };
            })[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
            /** @constant */
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
                error: {
                  code: string;
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
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
        search?: string;
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
            count: number;
            data: {
              /** Format: date-time */
              createdAt: string;
              description: string;
              id: string;
              name: string;
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
              teamId: string;
              type: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
          description?: string;
          name: string;
          parameters?: {
            /** Format: uuid */
            linkId?: string;
            /** Format: uuid */
            pixelId?: string;
            /** Format: uuid */
            websiteId?: string;
          };
          teamId?: string | null;
          type: never | 'open';
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
            /** Format: date-time */
            createdAt: string;
            description: string;
            id: string;
            name: string;
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
            teamId: string;
            type: string;
            /** Format: date-time */
            updatedAt: string;
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
            /** Format: date-time */
            createdAt: string;
            description: string;
            id: string;
            name: string;
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
            teamId: string;
            type: string;
            /** Format: date-time */
            updatedAt: string;
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
        boardId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          description?: string;
          name?: string;
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
            /** Format: date-time */
            createdAt: string;
            description: string;
            id: string;
            name: string;
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
            teamId: string;
            type: string;
            /** Format: date-time */
            updatedAt: string;
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
            /** @constant */
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
        boardId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          description?: string;
          name?: string;
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
            /** Format: date-time */
            createdAt: string;
            description: string;
            id: string;
            name: string;
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
            teamId: string;
            type: string;
            /** Format: date-time */
            updatedAt: string;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        maxResults?: number;
        os?: string;
        page?: number;
        pageSize?: number;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              /** Format: date-time */
              createdAt: string;
              entityId: string;
              id: string;
              name: string;
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
              shareType: number;
              slug: string;
              /** Format: date-time */
              updatedAt: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        boardId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          name: string;
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
            /** Format: date-time */
            createdAt: string;
            entityId: string;
            id: string;
            name: string;
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
            shareType: number;
            slug: string;
            /** Format: date-time */
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
            /** Format: date-time */
            createdAt: string;
            description: string;
            id: string;
            name: string;
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
            teamId: string;
            type: string;
            /** Format: date-time */
            updatedAt: string;
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
          description?: string;
          name?: string;
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
            /** Format: date-time */
            createdAt: string;
            description: string;
            id: string;
            name: string;
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
            teamId: string;
            type: string;
            /** Format: date-time */
            updatedAt: string;
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
            ok: boolean;
          };
        };
      };
    };
  };
  getLinks: {
    parameters: {
      query?: {
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
        search?: string;
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
            count: number;
            data: {
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              deletedAt: string;
              id: string;
              name: string;
              slug: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
              url: string;
              userId: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
          id?: string | null;
          name: string;
          slug: string;
          teamId?: string | null;
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
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            deletedAt: string;
            id: string;
            name: string;
            slug: string;
            teamId: string;
            /** Format: date-time */
            updatedAt: string;
            url: string;
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
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            deletedAt: string;
            id: string;
            name: string;
            slug: string;
            teamId: string;
            /** Format: date-time */
            updatedAt: string;
            url: string;
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
        linkId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          name?: string;
          slug?: string;
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
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            deletedAt: string;
            id: string;
            name: string;
            slug: string;
            teamId: string;
            /** Format: date-time */
            updatedAt: string;
            url: string;
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
            /** @constant */
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        maxResults?: number;
        os?: string;
        page?: number;
        pageSize?: number;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              /** Format: date-time */
              createdAt: string;
              entityId: string;
              id: string;
              name: string;
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
              shareType: number;
              slug: string;
              /** Format: date-time */
              updatedAt: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        linkId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          name: string;
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
            /** Format: date-time */
            createdAt: string;
            entityId: string;
            id: string;
            name: string;
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
            shareType: number;
            slug: string;
            /** Format: date-time */
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
        endAt?: number;
        ids: string;
        startAt?: number;
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
            apiKey?: {
              id: string;
              name: string;
            };
            authType?: 'session' | 'share' | 'api-key' | 'oauth';
            oauth?: {
              clientId: string;
              scopes: string[];
              tokenId?: string;
            };
            shareToken?: {
              boardId?: string;
              linkId?: string;
              linkIds?: string[];
              parameters?: {
                allowFilter?: boolean;
                theme?: 'light' | 'dark';
              } & {
                [key: string]: false | true | 'light' | 'dark';
              };
              pixelId?: string;
              pixelIds?: string[];
              shareType?: number;
              websiteId?: string;
              websiteIds?: string[];
            };
            user?: {
              id: string;
              isAdmin: boolean;
              role: string;
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
            /** Format: date-time */
            createdAt: string;
            id: string;
            keyPrefix: string;
            /** Format: date-time */
            lastUsedAt: string;
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
            /** Format: date-time */
            createdAt: string;
            id: string;
            key: string;
            keyPrefix: string;
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
            /** @constant */
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
          currentPassword: string;
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
            /** Format: date-time */
            createdAt: string;
            id: string;
            role: string;
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
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
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
            count: number;
            data: {
              accessCode: string;
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              deletedAt: string;
              id: string;
              logoUrl: string;
              name: string;
              twoFactorRequired: boolean;
              /** Format: date-time */
              updatedAt: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        includeTeams?: string;
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
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
            count: number;
            data: ({
              /** Format: date-time */
              createdAt: string;
              createdBy: string;
              /** Format: date-time */
              deletedAt: string;
              domain: string;
              id: string;
              name: string;
              recorderEnabled: boolean;
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
              /** Format: date-time */
              resetAt: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            } & {
              createUser?: {
                id: string;
                username: string;
              };
              shareId: string;
              team?: {
                members: {
                  role: string;
                  userId: string;
                }[];
              };
              user?: {
                id: string;
                username: string;
              };
            })[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
  describeOAuthAuthorization: {
    parameters: {
      query: {
        client_id: string;
        code_challenge?: string;
        code_challenge_method?: string;
        redirect_uri?: string;
        resource?: string;
        response_type?: string;
        scope?: string;
        state?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorization request details. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OAuthAuthorizationDetails'];
        };
      };
      /** @description Invalid authorization request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OAuthErrorResponse'];
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
  decideOAuthAuthorization: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OAuthAuthorizationDecision'];
      };
    };
    responses: {
      /** @description Redirect URL for the browser. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OAuthAuthorizationRedirect'];
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
  oauthRegisterClient: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OAuthClientRegistrationRequest'];
      };
    };
    responses: {
      /** @description Registered client. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OAuthClientRegistrationResponse'];
        };
      };
      /** @description Invalid client metadata. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OAuthErrorResponse'];
        };
      };
    };
  };
  oauthRevoke: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OAuthRevocationRequest'];
        'application/x-www-form-urlencoded': components['schemas']['OAuthRevocationRequest'];
      };
    };
    responses: {
      /** @description Token revoked (or already invalid). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': Record<string, never>;
        };
      };
      /** @description Malformed request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OAuthErrorResponse'];
        };
      };
    };
  };
  oauthToken: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OAuthTokenRequest'];
        'application/x-www-form-urlencoded': components['schemas']['OAuthTokenRequest'];
      };
    };
    responses: {
      /** @description Access and refresh tokens. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OAuthTokenResponse'];
        };
      };
      /** @description Invalid grant or request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OAuthErrorResponse'];
        };
      };
      /** @description Invalid client. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OAuthErrorResponse'];
        };
      };
    };
  };
  getPixels: {
    parameters: {
      query?: {
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
        search?: string;
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
            count: number;
            data: {
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              deletedAt: string;
              id: string;
              name: string;
              slug: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
          id?: string | null;
          name: string;
          slug: string;
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
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            deletedAt: string;
            id: string;
            name: string;
            slug: string;
            teamId: string;
            /** Format: date-time */
            updatedAt: string;
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
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            deletedAt: string;
            id: string;
            name: string;
            slug: string;
            teamId: string;
            /** Format: date-time */
            updatedAt: string;
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
        pixelId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          name?: string;
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
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            deletedAt: string;
            id: string;
            name: string;
            slug: string;
            teamId: string;
            /** Format: date-time */
            updatedAt: string;
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
            /** @constant */
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        maxResults?: number;
        os?: string;
        page?: number;
        pageSize?: number;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              /** Format: date-time */
              createdAt: string;
              entityId: string;
              id: string;
              name: string;
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
              shareType: number;
              slug: string;
              /** Format: date-time */
              updatedAt: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        pixelId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          name: string;
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
            /** Format: date-time */
            createdAt: string;
            entityId: string;
            id: string;
            name: string;
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
            shareType: number;
            slug: string;
            /** Format: date-time */
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
        endAt?: number;
        ids: string;
        startAt?: number;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
              browser: string;
              country: string;
              createdAt: string;
              device: string;
              eventName: string;
              hostname: string;
              os: string;
              referrerDomain: string;
              sessionId: string;
              urlPath: string;
            }[];
            referrers: {
              [key: string]: number;
            };
            series: {
              views: {
                t: string;
                x: string;
                y: number;
              }[];
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
              views: number;
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
                      pageH?: number;
                      pageW?: number;
                      pageX?: number;
                      pageY?: number;
                      timestamp?: number;
                      /** @constant */
                      type: 'click';
                      url: string;
                      viewportH?: number;
                      viewportW?: number;
                      x?: number;
                      y?: number;
                    }
                  | {
                      pageH?: number;
                      pageW?: number;
                      scrollPct?: number;
                      timestamp?: number;
                      /** @constant */
                      type: 'scroll';
                      url: string;
                      viewportH?: number;
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
                ok: boolean;
              }
            | {
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
        maxResults?: number;
        page?: number;
        pageSize?: number;
        type?: string;
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
            count: number;
            data: ({
              /** Format: date-time */
              createdAt: string;
              description: string;
              id: string;
              name: string;
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
              /** Format: date-time */
              updatedAt: string;
              userId: string;
              websiteId: string;
            } & {
              website?: {
                domain: string;
                userId: string;
              };
            })[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
          description?: string;
          name: string;
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /** Format: uuid */
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
            /** Format: date-time */
            createdAt: string;
            description: string;
            id: string;
            name: string;
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
            /** Format: date-time */
            updatedAt: string;
            userId: string;
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
            /** Format: date-time */
            createdAt: string;
            description: string;
            id: string;
            name: string;
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
            /** Format: date-time */
            updatedAt: string;
            userId: string;
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
        reportId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          description?: string;
          name: string;
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /** Format: uuid */
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
            /** Format: date-time */
            createdAt: string;
            description: string;
            id: string;
            name: string;
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
            /** Format: date-time */
            updatedAt: string;
            userId: string;
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
            /** @constant */
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
          filters: {
            [key: string]: unknown;
          };
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /** Format: uuid */
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
              name: string;
              value: number;
            }[];
            referrer: {
              name: string;
              value: number;
            }[];
            total: {
              pageviews: number;
              visitors: number;
              visits: number;
            };
            utm_campaign: {
              name: string;
              value: number;
            }[];
            utm_content: {
              name: string;
              value: number;
            }[];
            utm_medium: {
              name: string;
              value: number;
            }[];
            utm_source: {
              name: string;
              value: number;
            }[];
            utm_term: {
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
          filters: {
            [key: string]: unknown;
          };
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /** Format: uuid */
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
            bounces: number;
            totaltime: number;
            views: number;
            visitors: number;
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
          filters: {
            [key: string]: unknown;
          };
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /** Format: uuid */
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
            filters?: {
              operator: string;
              property: string;
              value: string;
            }[];
            previous: number;
            remaining: number;
            type: string;
            value: string;
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
          filters: {
            [key: string]: unknown;
          };
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /** Format: uuid */
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
          filters: {
            [key: string]: unknown;
          };
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /** Format: uuid */
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
              count: number;
              sessions: number;
              urlPath: string;
            }[];
            points: {
              count: number;
              pageH: number;
              pageW: number;
              pageX: number;
              pageY: number;
              viewportH: number;
              viewportW: number;
              x: number;
              y: number;
            }[];
            scroll: {
              buckets: {
                depth: number;
                pageH: number;
                pageW: number;
                sessions: number;
                viewportH: number;
                viewportW: number;
              }[];
              pageH: number;
              pageW: number;
              totalSessions: number;
              viewportH: number;
              viewportW: number;
            };
            snapshot: {
              id: string;
              /** @constant */
              kind: 'iframe';
              pageH: number;
              pageW: number;
              url: string;
              viewportH: number;
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
          filters: {
            [key: string]: unknown;
          };
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /** Format: uuid */
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
          filters: {
            [key: string]: unknown;
          };
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /** Format: uuid */
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
          filters: {
            [key: string]: unknown;
          };
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /** Format: uuid */
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
          filters: {
            [key: string]: unknown;
          };
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /** Format: uuid */
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
              name: string;
              value: number;
            }[];
            chart: {
              count: number;
              t: string;
              x: string;
              y: number;
            }[];
            country: {
              name: string;
              value: number;
            }[];
            referrer: {
              name: string;
              value: number;
            }[];
            region: {
              country: string;
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
          filters: {
            [key: string]: unknown;
          };
          parameters: {
            [key: string]: unknown;
          };
          type: string;
          /** Format: uuid */
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
            browser?: string;
            cls?: number;
            data?: {
              [key: string]: unknown;
            };
            device?: string;
            fcp?: number;
            hostname?: string;
            id?: string;
            inp?: number;
            ip?: string;
            language?: string;
            lcp?: number;
            /** Format: uuid */
            link?: string;
            name?: unknown;
            os?: string;
            /** Format: uuid */
            pixel?: string;
            referrer?: string;
            screen?: string;
            tag?: unknown;
            timestamp?: number;
            title?: string;
            ttfb?: number;
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
                sessionId: unknown;
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
          /** Format: uuid */
          entityId: string;
          name: string;
          parameters: {
            [key: string]: unknown;
          };
          shareType: number;
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
            /** Format: date-time */
            createdAt: string;
            entityId: string;
            id: string;
            name: string;
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
            shareType: number;
            slug: string;
            /** Format: date-time */
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
            /** Format: date-time */
            createdAt: string;
            entityId: string;
            id: string;
            name: string;
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
            shareType: number;
            slug: string;
            /** Format: date-time */
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
        shareId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          name: string;
          parameters: {
            [key: string]: unknown;
          };
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
            /** Format: date-time */
            createdAt: string;
            entityId: string;
            id: string;
            name: string;
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
            shareType: number;
            slug: string;
            /** Format: date-time */
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
            /** @constant */
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
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
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
            count: number;
            data: {
              accessCode: string;
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              deletedAt: string;
              id: string;
              logoUrl: string;
              name: string;
              twoFactorRequired: boolean;
              /** Format: date-time */
              updatedAt: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
              accessCode: string;
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              deletedAt: string;
              id: string;
              logoUrl: string;
              name: string;
              twoFactorRequired: boolean;
              /** Format: date-time */
              updatedAt: string;
            },
            {
              /** Format: date-time */
              createdAt: string;
              id: string;
              role: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
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
            accessCode: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            deletedAt: string;
            id: string;
            logoUrl: string;
            name: string;
            twoFactorRequired: boolean;
            /** Format: date-time */
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
        teamId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          accessCode?: string;
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
            accessCode: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            deletedAt: string;
            id: string;
            logoUrl: string;
            name: string;
            twoFactorRequired: boolean;
            /** Format: date-time */
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
            /** @constant */
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
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
        search?: string;
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              /** Format: date-time */
              createdAt: string;
              description: string;
              id: string;
              name: string;
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
              teamId: string;
              type: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
        search?: string;
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              deletedAt: string;
              id: string;
              name: string;
              slug: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
              url: string;
              userId: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
        search?: string;
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              deletedAt: string;
              id: string;
              name: string;
              slug: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        maxResults?: number;
        page?: number;
        pageSize?: number;
        search?: string;
      };
      header?: never;
      path: {
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
            count: number;
            data: ({
              /** Format: date-time */
              createdAt: string;
              id: string;
              role: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            } & {
              user?: {
                id: string;
                username: string;
              };
            })[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        teamId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @enum {string} */
          role: 'team-member' | 'team-view-only' | 'team-manager';
          /** Format: uuid */
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
            /** Format: date-time */
            createdAt: string;
            id: string;
            role: string;
            teamId: string;
            /** Format: date-time */
            updatedAt: string;
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
        teamId: string;
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
            /** Format: date-time */
            createdAt: string;
            id: string;
            role: string;
            teamId: string;
            /** Format: date-time */
            updatedAt: string;
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
        teamId: string;
        userId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @enum {string} */
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
            /** Format: date-time */
            createdAt: string;
            id: string;
            role: string;
            teamId: string;
            /** Format: date-time */
            updatedAt: string;
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
        teamId: string;
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
            /** @constant */
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
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
        search?: string;
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path: {
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
            count: number;
            data: ({
              /** Format: date-time */
              createdAt: string;
              createdBy: string;
              /** Format: date-time */
              deletedAt: string;
              domain: string;
              id: string;
              name: string;
              recorderEnabled: boolean;
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
              /** Format: date-time */
              resetAt: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            } & {
              createUser?: {
                id: string;
                username: string;
              };
              shareId: string;
              team?: {
                members: {
                  role: string;
                  userId: string;
                }[];
              };
              user?: {
                id: string;
                username: string;
              };
            })[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
            /** Format: date-time */
            createdAt: string;
            id: string;
            role: string;
            teamId: string;
            /** Format: date-time */
            updatedAt: string;
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
          /** Format: uuid */
          id?: string;
          password: string;
          /** @enum {string} */
          role: 'admin' | 'user' | 'view-only';
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
            id: string;
            role: string;
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
              apiKeys: number;
              boards: number;
              createdBy: number;
              links: number;
              oauthAuthorizationCodes: number;
              oauthRefreshTokens: number;
              pixels: number;
              reports: number;
              teams: number;
              twoFactorAuth: number;
              twoFactorBackupCodes: number;
              twoFactorOtpUseds: number;
              twoFactorRateLimit: number;
              websites: number;
            };
            apiKeys: {
              /** Format: date-time */
              createdAt: string;
              id: string;
              keyHash: string;
              keyPrefix: string;
              /** Format: date-time */
              lastUsedAt: string;
              name: string;
              userId: string;
            }[];
            boards: {
              /** Format: date-time */
              createdAt: string;
              description: string;
              id: string;
              name: string;
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
              teamId: string;
              type: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            }[];
            /** Format: date-time */
            createdAt: string;
            createdBy: {
              /** Format: date-time */
              createdAt: string;
              createdBy: string;
              /** Format: date-time */
              deletedAt: string;
              domain: string;
              id: string;
              name: string;
              recorderEnabled: boolean;
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
              /** Format: date-time */
              resetAt: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            }[];
            id: string;
            links: {
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              deletedAt: string;
              id: string;
              name: string;
              slug: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
              url: string;
              userId: string;
            }[];
            oauthAuthorizationCodes: {
              clientId: string;
              codeChallenge: string;
              codeChallengeMethod: string;
              codeHash: string;
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              expiresAt: string;
              id: string;
              redirectUri: string;
              resource: string;
              scope: string;
              /** Format: date-time */
              usedAt: string;
              userId: string;
            }[];
            oauthRefreshTokens: {
              clientId: string;
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              expiresAt: string;
              id: string;
              /** Format: date-time */
              lastUsedAt: string;
              resource: string;
              /** Format: date-time */
              revokedAt: string;
              scope: string;
              tokenHash: string;
              userId: string;
            }[];
            password: string;
            pixels: {
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              deletedAt: string;
              id: string;
              name: string;
              slug: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            }[];
            reports: {
              /** Format: date-time */
              createdAt: string;
              description: string;
              id: string;
              name: string;
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
              /** Format: date-time */
              updatedAt: string;
              userId: string;
              websiteId: string;
            }[];
            role: string;
            teams: {
              /** Format: date-time */
              createdAt: string;
              id: string;
              role: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            }[];
            twoFactorAuth: {
              /** Format: date-time */
              createdAt: string;
              id: string;
              isEnabled: boolean;
              secret: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            };
            twoFactorBackupCodes: {
              codeHash: string;
              /** Format: date-time */
              createdAt: string;
              id: string;
              used: boolean;
              userId: string;
            }[];
            twoFactorOtpUseds: {
              /** Format: date-time */
              expiresAt: string;
              id: string;
              otp: string;
              userId: string;
            }[];
            twoFactorRateLimit: {
              attempts: number;
              id: string;
              /** Format: date-time */
              lockedUntil: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            };
            twoFactorRequired: boolean;
            username: string;
            websites: {
              /** Format: date-time */
              createdAt: string;
              createdBy: string;
              /** Format: date-time */
              deletedAt: string;
              domain: string;
              id: string;
              name: string;
              recorderEnabled: boolean;
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
              /** Format: date-time */
              resetAt: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
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
        userId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          password?: string;
          /** @enum {string} */
          role?: 'admin' | 'user' | 'view-only';
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
            /** Format: date-time */
            createdAt: string;
            id: string;
            role: string;
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
            /** @constant */
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
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              accessCode: string;
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              deletedAt: string;
              id: string;
              logoUrl: string;
              name: string;
              twoFactorRequired: boolean;
              /** Format: date-time */
              updatedAt: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        includeTeams?: string;
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
        search?: string;
        sortDescending?: 'true' | 'false';
      };
      header?: never;
      path: {
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
            count: number;
            data: ({
              /** Format: date-time */
              createdAt: string;
              createdBy: string;
              /** Format: date-time */
              deletedAt: string;
              domain: string;
              id: string;
              name: string;
              recorderEnabled: boolean;
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
              /** Format: date-time */
              resetAt: string;
              teamId: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
            } & {
              createUser?: {
                id: string;
                username: string;
              };
              shareId: string;
              team?: {
                members: {
                  role: string;
                  userId: string;
                }[];
              };
              user?: {
                id: string;
                username: string;
              };
            })[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        maxResults?: number;
        orderBy?: string;
        page?: number;
        pageSize?: number;
        search?: string;
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
        endAt?: number;
        maxResults?: number;
        page?: number;
        pageSize?: number;
        search?: string;
        startAt?: number;
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              allDay: boolean;
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              date: string;
              id: string;
              note: string;
              /** Format: date-time */
              updatedAt: string;
              userId: string;
              websiteId: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          allDay?: boolean;
          /** Format: date-time */
          date: string;
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
            allDay: boolean;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            date: string;
            id: string;
            note: string;
            /** Format: date-time */
            updatedAt: string;
            userId: string;
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
        annotationId: string;
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
            allDay: boolean;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            date: string;
            id: string;
            note: string;
            /** Format: date-time */
            updatedAt: string;
            userId: string;
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
        annotationId: string;
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          allDay?: boolean;
          /** Format: date-time */
          date: string;
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
            allDay: boolean;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            date: string;
            id: string;
            note: string;
            /** Format: date-time */
            updatedAt: string;
            userId: string;
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
        annotationId: string;
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
            /** @constant */
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
  getWebsiteDateRange: {
    parameters: {
      query?: never;
      header?: never;
      path: {
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
            /** Format: date-time */
            endDate: string;
            /** Format: date-time */
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        maxResults?: number;
        os?: string;
        page?: number;
        pageSize?: number;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              eventId: string;
              eventName: string;
              eventProperties: {
                createdAt: string;
                dataKey: string;
                dataType: number;
                dateValue: string;
                numberValue: number;
                stringValue: string;
              }[];
              websiteId: string;
            }[];
            page: number;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventName: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        maxResults?: number;
        os?: string;
        page?: number;
        pageSize?: number;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              createdAt: string;
              eventId: string;
              eventName: string;
              propertyKeys: string[];
              propertyValues: string[];
              sessionId: string;
              urlPath: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventName: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        propertyName: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventName: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        propertyName: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventName: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        metric?: 'sum' | 'avg' | 'count';
        os?: string;
        path?: string;
        propertyName: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventName: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        propertyName: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            average: number;
            max: number;
            median: number;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventName: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        propertyName: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        eventId: string;
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
            /** Format: date-time */
            createdAt: string;
            dataKey: string;
            dataType: number;
            /** Format: date-time */
            dateValue: string;
            id: string;
            numberValue: {
              d: number[];
              e: number;
              s: number;
            };
            stringValue: string;
            websiteEventId: string;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            dataType: number;
            eventName?: string;
            propertyName: string;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventName?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            dataType: number;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            dataType: number;
            eventName: string;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        dataType?: number;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventName?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        propertyName: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        compare?: 'prev' | 'yoy';
        country?: string;
        device?: string;
        distinctId?: string;
        endAt?: number;
        endDate?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        maxResults?: number;
        os?: string;
        page?: number;
        pageSize?: number;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        search?: string;
        segment?: string;
        startAt?: number;
        startDate?: string;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        limit?: number;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        compare?: 'prev' | 'yoy';
        country?: string;
        device?: string;
        distinctId?: string;
        endAt?: number;
        endDate?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt?: number;
        startDate?: string;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            data: {
              comparison: {
                events: number;
                uniqueEvents: number;
                visitors: number;
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
        compare?: 'prev' | 'yoy';
        endAt?: number;
        endDate?: string;
        maxResults?: number;
        page?: number;
        pageSize?: number;
        startAt?: number;
        startDate?: string;
        timezone?: string;
        unit?: string;
      };
      header?: never;
      path: {
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
  getWebsiteMetrics: {
    parameters: {
      query: {
        browser?: string;
        city?: string;
        cohort?: string;
        compare?: 'prev' | 'yoy';
        country?: string;
        device?: string;
        distinctId?: string;
        endAt?: number;
        endDate?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        limit?: number;
        match?: 'all' | 'any';
        offset?: number;
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        search?: string;
        segment?: string;
        startAt?: number;
        startDate?: string;
        tag?: string;
        timezone?: string;
        title?: string;
        /** @description Dimension to rank: path, entry, exit, title, query, hostname, referrer, domain, channel, event, tag, browser, os, device, screen, language, country, region, city, distinctId, utmSource, utmMedium, utmCampaign, utmContent, utmTerm. */
        type: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
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
        browser?: string;
        city?: string;
        cohort?: string;
        compare?: 'prev' | 'yoy';
        country?: string;
        device?: string;
        distinctId?: string;
        endAt?: number;
        endDate?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        limit?: number;
        match?: 'all' | 'any';
        offset?: number;
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        search?: string;
        segment?: string;
        startAt?: number;
        startDate?: string;
        tag?: string;
        timezone?: string;
        title?: string;
        type: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            bounces: number;
            name: string;
            pageviews: number;
            totaltime: number;
            visitors: number;
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
        browser?: string;
        city?: string;
        cohort?: string;
        compare?: 'prev' | 'yoy';
        country?: string;
        device?: string;
        distinctId?: string;
        endAt?: number;
        endDate?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt?: number;
        startDate?: string;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
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
  getWebsiteRecorderConfig: {
    parameters: {
      query?: never;
      header?: never;
      path: {
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
                blockSelector: string;
                enabled: boolean;
                heatmapEnabled: boolean;
                heatmapSampleRate: number;
                maskLevel: 'strict' | 'moderate';
                maxDuration: number;
                replayEnabled: boolean;
                sampleRate: number;
              };
        };
      };
    };
  };
  getWebsiteReplays: {
    parameters: {
      query?: {
        browser?: string;
        city?: string;
        cohort?: string;
        compare?: 'prev' | 'yoy';
        country?: string;
        device?: string;
        distinctId?: string;
        endAt?: number;
        endDate?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        maxResults?: number;
        minDuration?: number;
        os?: string;
        page?: number;
        pageSize?: number;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        search?: string;
        segment?: string;
        startAt?: number;
        startDate?: string;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              browser: string;
              chunkCount: number;
              city: string;
              country: string;
              createdAt: string;
              device: string;
              duration: number;
              endedAt: string;
              eventCount: number;
              id: string;
              os: string;
              sessionId: string;
              startedAt: string;
              websiteId: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        replayId: string;
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
            chunkCount: number;
            /** Format: date-time */
            endedAt: string;
            eventCount: number;
            events: unknown[];
            sessionId: string;
            /** Format: date-time */
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
        maxResults?: number;
        page?: number;
        pageSize?: number;
        search?: string;
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              /** Format: date-time */
              createdAt: string;
              id: string;
              name: string;
              /** Format: date-time */
              updatedAt: string;
              visitId: string;
              websiteId: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        replayId: string;
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
        replayId: string;
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          isSaved: boolean;
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
        maxResults?: number;
        page?: number;
        pageSize?: number;
        type?: string;
      };
      header?: never;
      path: {
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
            count: number;
            data: ({
              /** Format: date-time */
              createdAt: string;
              description: string;
              id: string;
              name: string;
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
              /** Format: date-time */
              updatedAt: string;
              userId: string;
              websiteId: string;
            } & {
              website?: {
                domain: string;
                userId: string;
              };
            })[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
            /** @constant */
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
  getWebsiteRevenueChart: {
    parameters: {
      query: {
        browser?: string;
        city?: string;
        cohort?: string;
        compare?: 'prev' | 'yoy';
        country?: string;
        currency: string;
        device?: string;
        distinctId?: string;
        endAt?: number;
        endDate?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt?: number;
        startDate?: string;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        compare?: 'prev' | 'yoy';
        country?: string;
        currency: string;
        device?: string;
        distinctId?: string;
        endAt?: number;
        endDate?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt?: number;
        startDate?: string;
        tag?: string;
        timezone?: string;
        title?: string;
        type: 'country' | 'region' | 'referrer' | 'channel';
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
                name: string;
                value: number;
              }[]
            | {
                country: string;
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
        browser?: string;
        city?: string;
        cohort?: string;
        compare?: 'prev' | 'yoy';
        country?: string;
        currency: string;
        device?: string;
        distinctId?: string;
        endAt?: number;
        endDate?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        maxResults?: number;
        os?: string;
        page?: number;
        pageSize?: number;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        search?: string;
        segment?: string;
        startAt?: number;
        startDate?: string;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              browser: string;
              city: string;
              country: string;
              createdAt: string;
              device: string;
              events: number;
              firstAt: string;
              hostname: string;
              id: string;
              language: string;
              lastAt: string;
              os: string;
              region: string;
              screen: string;
              views: number;
              visits: number;
              websiteId: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        browser?: string;
        city?: string;
        cohort?: string;
        compare?: 'prev' | 'yoy';
        country?: string;
        currency: string;
        device?: string;
        distinctId?: string;
        endAt?: number;
        endDate?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt?: number;
        startDate?: string;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        search?: string;
        type: 'segment' | 'cohort';
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              /** Format: date-time */
              createdAt: string;
              id: string;
              name: string;
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
              /** Format: date-time */
              updatedAt: string;
              websiteId: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          name: string;
          parameters: {
            action?: {
              type: string;
              value: string;
            };
            dateRange?: string;
            filters?: {
              [key: string]: unknown;
            }[];
            /** @enum {string} */
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
            /** Format: date-time */
            createdAt: string;
            id: string;
            name: string;
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
            /** Format: date-time */
            updatedAt: string;
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
        segmentId: string;
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
            /** Format: date-time */
            createdAt: string;
            id: string;
            name: string;
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
            /** Format: date-time */
            updatedAt: string;
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
        segmentId: string;
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          name: string;
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
            /** Format: date-time */
            createdAt: string;
            id: string;
            name: string;
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
            /** Format: date-time */
            updatedAt: string;
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
        segmentId: string;
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
            /** @constant */
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        maxResults?: number;
        os?: string;
        page?: number;
        pageSize?: number;
        path?: string;
        propertyName: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              createdAt: string;
              distinctId: string;
              propertyKeys: string[];
              propertyValues: string[];
              sessionId: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        propertyName: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        propertyName: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        metric?: 'sum' | 'avg' | 'count';
        os?: string;
        path?: string;
        propertyName: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        propertyName: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            average: number;
            max: number;
            median: number;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        propertyName?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            dataType: number;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        propertyName: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        propertyName: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            views: number;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        dataType?: number;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        propertyName?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        compare?: 'prev' | 'yoy';
        country?: string;
        device?: string;
        distinctId?: string;
        endAt?: number;
        endDate?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        maxResults?: number;
        os?: string;
        page?: number;
        pageSize?: number;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        search?: string;
        segment?: string;
        startAt?: number;
        startDate?: string;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
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
        sessionId: string;
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
            distinctIds: unknown;
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
        sessionId: string;
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
            /** @constant */
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
        distinctId?: string;
        endAt: number;
        startAt: number;
      };
      header?: never;
      path: {
        sessionId: string;
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
            createdAt: string;
            eventId: string;
            eventName: string;
            eventType: number;
            hasData: boolean;
            hostname: string;
            referrerDomain: string;
            urlPath: string;
            urlQuery: string;
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
        sessionId: string;
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
            createdAt: string;
            dataKey: string;
            dataType: number;
            dateValue: string;
            numberValue: number;
            sessionId: string;
            stringValue: string;
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
        compare?: 'prev' | 'yoy';
        endAt?: number;
        endDate?: string;
        maxResults?: number;
        page?: number;
        pageSize?: number;
        search?: string;
        startAt?: number;
        startDate?: string;
        timezone?: string;
        unit?: string;
      };
      header?: never;
      path: {
        sessionId: string;
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
            count: number;
            data: {
              browser: string;
              chunkCount: number;
              city: string;
              country: string;
              createdAt: string;
              device: string;
              duration: number;
              endedAt: string;
              eventCount: number;
              id: string;
              os: string;
              sessionId: string;
              startedAt: string;
              websiteId: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        endAt: number;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt: number;
        tag?: string;
        timezone: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
        browser?: string;
        city?: string;
        cohort?: string;
        country?: string;
        device?: string;
        distinctId?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        maxResults?: number;
        os?: string;
        page?: number;
        pageSize?: number;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        tag?: string;
        title?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
        utmTerm?: string;
      };
      header?: never;
      path: {
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
            count: number;
            data: {
              /** Format: date-time */
              createdAt: string;
              entityId: string;
              id: string;
              name: string;
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
              shareType: number;
              slug: string;
              /** Format: date-time */
              updatedAt: string;
            }[];
            isCapped?: boolean;
            orderBy?: string;
            page: number;
            pageSize: number;
            search?: string;
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
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          name: string;
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
            /** Format: date-time */
            createdAt: string;
            entityId: string;
            id: string;
            name: string;
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
            shareType: number;
            slug: string;
            /** Format: date-time */
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
        browser?: string;
        city?: string;
        cohort?: string;
        compare?: 'prev' | 'yoy';
        country?: string;
        device?: string;
        distinctId?: string;
        endAt?: number;
        endDate?: string;
        event?: string;
        eventType?: number;
        excludeBounce?: string;
        hostname?: string;
        language?: string;
        match?: 'all' | 'any';
        os?: string;
        path?: string;
        query?: string;
        referrer?: string;
        region?: string;
        segment?: string;
        startAt?: number;
        startDate?: string;
        tag?: string;
        timezone?: string;
        title?: string;
        unit?: string;
        utmCampaign?: string;
        utmContent?: string;
        utmMedium?: string;
        utmSource?: string;
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
        websiteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** Format: uuid */
          teamId?: string;
          /** Format: uuid */
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
            /** Format: date-time */
            createdAt: string;
            createdBy: string;
            /** Format: date-time */
            deletedAt: string;
            domain: string;
            id: string;
            name: string;
            recorderEnabled: boolean;
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
            /** Format: date-time */
            resetAt: string;
            teamId: string;
            /** Format: date-time */
            updatedAt: string;
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
  getWebsiteValues: {
    parameters: {
      query: {
        compare?: 'prev' | 'yoy';
        endAt?: number;
        endDate?: string;
        search?: string;
        startAt?: number;
        startDate?: string;
        timezone?: string;
        type: string;
        unit?: string;
      };
      header?: never;
      path: {
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
        endAt?: number;
        ids: string;
        startAt?: number;
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
