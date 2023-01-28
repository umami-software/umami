import { defineMessages } from 'react-intl';

export const labels = defineMessages({
  unknown: { id: 'label.unknown', defaultMessage: 'Unknown' },
  required: { id: 'label.required', defaultMessage: 'Required' },
  save: { id: 'label.save', defaultMessage: 'Save' },
  cancel: { id: 'label.cancel', defaultMessage: 'Cancel' },
  continue: { id: 'label.continue', defaultMessage: 'Continue' },
  delete: { id: 'label.delete', defaultMessage: 'Delete' },
  users: { id: 'label.users', defaultMessage: 'Users' },
  createUser: { id: 'label.create-user', defaultMessage: 'Create user' },
  username: { id: 'label.username', defaultMessage: 'Username' },
  password: { id: 'label.password', defaultMessage: 'Password' },
  role: { id: 'label.role', defaultMessage: 'Role' },
  user: { id: 'label.user', defaultMessage: 'User' },
  admin: { id: 'label.admin', defaultMessage: 'Admin' },
  confirm: { id: 'label.confirm', defaultMessage: 'Confirm' },
  details: { id: 'label.details', defaultMessage: 'Details' },
  websites: { id: 'label.websites', defaultMessage: 'Websites' },
  created: { id: 'label.created', defaultMessage: 'Created' },
  edit: { id: 'label.edit', defaultMessage: 'Edit' },
  name: { id: 'label.name', defaultMessage: 'Name' },
  members: { id: 'label.members', defaultMessage: 'Members' },
  accessCode: { id: 'label.access-code', defaultMessage: 'Access code' },
  teamId: { id: 'label.team-id', defaultMessage: 'Team ID' },
  team: { id: 'label.team', defaultMessage: 'Team' },
  regenerate: { id: 'label.regenerate', defaultMessage: 'Regenerate' },
  remove: { id: 'label.remove', defaultMessage: 'Remove' },
  createTeam: { id: 'label.create-team', defaultMessage: 'Create team' },
  settings: { id: 'label.settings', defaultMessage: 'Settings' },
  teamOwner: { id: 'label.team-owner', defaultMessage: 'Team owner' },
  teamMember: { id: 'label.team-member', defaultMessage: 'Team member' },
  teamGuest: { id: 'label.team-guest', defaultMessage: 'Team guest' },
  enableShareUrl: { id: 'label.enable-share-url', defaultMessage: 'Enable share URL' },
  data: { id: 'label.data', defaultMessage: 'Data' },
  trackingCode: { id: 'label.tracking-code', defaultMessage: 'Tracking code' },
  shareUrl: { id: 'label.share-url', defaultMessage: 'Share URL' },
  actions: { id: 'label.actions', defaultMessage: 'Actions' },
  view: { id: 'label.view', defaultMessage: 'View' },
  domain: { id: 'label.domain', defaultMessage: 'Domain' },
  websiteId: { id: 'label.website-id', defaultMessage: 'Website ID' },
  resetWebsite: { id: 'label.reset-website', defaultMessage: 'Reset website' },
  deleteWebsite: { id: 'label.delete-website', defaultMessage: 'Delete website' },
  reset: { id: 'label.reset', defaultMessage: 'Reset' },
  addWebsite: { id: 'label.add-website', defaultMessage: 'Add website' },
  changePassword: { id: 'label.change-password', defaultMessage: 'Change password' },
  currentPassword: { id: 'label.current-password', defaultMessage: 'Current password' },
  newPassword: { id: 'label.new-password', defaultMessage: 'New password' },
  confirmPassword: { id: 'label.confirm-password', defaultMessage: 'Confirm password' },
  timezone: { id: 'label.timezone', defaultMessage: 'Timezone' },
  dateRange: { id: 'label.default-date-range', defaultMessage: 'Default date range' },
  language: { id: 'label.language', defaultMessage: 'Language' },
  theme: { id: 'label.theme', defaultMessage: 'Theme' },
  profile: { id: 'label.profile', defaultMessage: 'Profile' },
  dashboard: { id: 'label.dashboard', defaultMessage: 'Dashboard' },
  more: { id: 'label.more', defaultMessage: 'More' },
  realtime: { id: 'label.realtime', defaultMessage: 'Realtime' },
  queries: { id: 'label.queries', defaultMessage: 'Queries' },
  teams: { id: 'label.teams', defaultMessage: 'Teams' },
  analytics: { id: 'label.analytics', defaultMessage: 'Analytics' },
  logout: { id: 'label.logout', defaultMessage: 'Logout' },
});

export const messages = defineMessages({
  error: { id: 'message.error', defaultMessage: 'Something went wrong.' },
  saved: { id: 'message.saved', defaultMessage: 'Saved.' },
  noUsers: { id: 'message.no-users', defaultMessage: 'There are no users.' },
  userDeleted: { id: 'message.user-deleted', defaultMessage: 'User deleted.' },
  noData: { id: 'message.no-data', defaultMessage: 'No data available.' },
  deleteUserWarning: {
    id: 'message.delete-user-warning',
    defaultMessage: 'Are you sure you want to delete the user {username}?',
  },
  minPasswordLength: {
    id: 'message.min-password-length',
    defaultMessage: 'Minimum length of 8 characters',
  },
  noTeams: {
    id: 'message.no-teams',
    defaultMessage: 'You have no created any teams.',
  },
  shareUrl: {
    id: 'message.share-url',
    defaultMessage: 'Your website stats are publically available at the following URL:',
  },
  trackingCode: {
    id: 'message.tracking-code',
    defaultMessage:
      'To track stats for this website, place the following code in the <head>...</head> section of your HTML.',
  },
  deleteWebsite: {
    id: 'message.delete-website',
    defaultMessage: 'To delete this website, type {confirmation} in the box below to confirm.',
  },
  resetWebsite: {
    id: 'message.reset-website',
    defaultMessage: 'To reset this website, type {confirmation} in the box below to confirm.',
  },
  invalidDomain: {
    id: 'message.invalid-domain',
    defaultMessage: 'Invalid domain. Do not include http/https.',
  },
  resetWebsiteWarning: {
    id: 'message.reset-website-warning',
    defaultMessage:
      'All statistics for this website will be deleted, but your settings will remain intact.',
  },
  deleteWebsiteWarning: {
    id: 'message.delete-website-warning',
    defaultMessage: 'All website data will be deleted.',
  },
  noWebsites: {
    id: 'messages.no-websites',
    defaultMessage: 'You do not have any websites configured.',
  },
  noMatchPassword: { id: 'message.no-match-password', defaultMessage: 'Passwords do not match.' },
  goToSettings: {
    id: 'message.go-to-settings',
    defaultMessage: 'Go to settings',
  },
});

export const devices = defineMessages({
  desktop: { id: 'metrics.device.desktop', defaultMessage: 'Desktop' },
  laptop: { id: 'metrics.device.laptop', defaultMessage: 'Laptop' },
  tablet: { id: 'metrics.device.tablet', defaultMessage: 'Tablet' },
  mobile: { id: 'metrics.device.mobile', defaultMessage: 'Mobile' },
});

export function getDeviceMessage(device) {
  return devices[device] || labels.unknown;
}
