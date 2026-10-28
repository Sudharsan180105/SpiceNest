
const { verifyFirebaseToken } = require('./firebaseAuth');

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

function requireAdmin(req, res, next) {
  verifyFirebaseToken(req, res, () => {
    const rawEmail = req.firebaseUser?.email;
    const email = rawEmail?.trim().toLowerCase() || null;
    const allowed = Boolean(email && ADMIN_EMAILS.has(email));

    console.log('[Admin authorization check]', {
      email,
      emailPresent: Boolean(email),
      allowlistMatch: allowed,
      allowlistCount: ADMIN_EMAILS.size,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. An authorized administrator account is required.',
      });
    }

    return next();
  });
}

module.exports = { requireAdmin };
