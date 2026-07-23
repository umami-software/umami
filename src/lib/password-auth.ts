export function isPasswordAuthDisabled() {
  return !!(process.env.DISABLE_LOGIN || process.env.CLOUD_MODE);
}
