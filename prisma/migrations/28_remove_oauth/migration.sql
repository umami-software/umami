-- Remove the retired OAuth server's data. API keys are stored separately.
DROP TABLE "oauth_authorization_code";
DROP TABLE "oauth_refresh_token";
DROP TABLE "oauth_client";
