import { badRequest, hashPassword, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getAccountById, deleteAccount, getAccountByUsername, updateAccount } from 'queries';
import { useAuth } from 'lib/middleware';

export default async (req, res) => {
  await useAuth(req, res);

  const { is_admin: currentUserIsAdmin, user_id: currentUserId } = req.auth;
  const { id } = req.query;
  const userId = +id;

  if (req.method === 'GET') {
    if (userId !== currentUserId && !currentUserIsAdmin) {
      return unauthorized(res);
    }

    const account = await getAccountById(userId);

    return ok(res, account);
  }

  if (req.method === 'POST') {
    const { username, password, is_admin } = req.body;

    if (userId !== currentUserId && !currentUserIsAdmin) {
      return unauthorized(res);
    }

    const account = await getAccountById(userId);

    const data = {};

    if (password) {
      data.password = hashPassword(password);
    }

    // Only admin can change these fields
    if (currentUserIsAdmin) {
      data.username = username;
      data.isAdmin = is_admin;
    }

    // Check when username changes
    if (data.username && account.username !== data.username) {
      const accountByUsername = await getAccountByUsername(username);

      if (accountByUsername) {
        return badRequest(res, 'Account already exists');
      }
    }

    const updated = await updateAccount(userId, data);

    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    if (!currentUserIsAdmin) {
      return unauthorized(res);
    }

    await deleteAccount(userId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
