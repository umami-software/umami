import { createAccount } from './account/createAccount';
import { deleteAccount } from './account/deleteAccount';
import { getAccountById } from './account/getAccountById';
import { getAccountByUsername } from './account/getAccountByUsername';
import { getAccounts } from './account/getAccounts';
import { updateAccount } from './account/updateAccount';
import { createWebsite } from './website/createWebsite';
import { deleteWebsite } from './website/deleteWebsite';
import { getAllWebsites } from './website/getAllWebsites';
import { getUserWebsites } from './website/getUserWebsites';
import { getWebsiteById } from './website/getWebsiteById';
import { getWebsiteByShareId } from './website/getWebsiteByShareId';
import { getWebsiteByUuid } from './website/getWebsiteByUuid';
import { resetWebsite } from './website/resetWebsite';
import { updateWebsite } from './website/updateWebsite';

export default {
  createWebsite,
  deleteWebsite,
  getAllWebsites,
  getUserWebsites,
  getWebsiteById,
  getWebsiteByShareId,
  getWebsiteByUuid,
  resetWebsite,
  updateWebsite,
  createAccount,
  deleteAccount,
  getAccountById,
  getAccountByUsername,
  getAccounts,
  updateAccount,
};
