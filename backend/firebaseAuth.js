
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

const serviceAccountPath = path.join(
  __dirname,
  'firebase-service-account.json'
);

const serviceAccount = require(serviceAccountPath);

const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
    });

const firebaseAuth = getAuth(firebaseApp);

async function verifyFirebaseToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is required.',
    });
  }

  const idToken = authorization.slice(7).trim();

  if (!idToken) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is required.',
    });
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);

    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || decodedToken.displayName || null,
      emailVerified: decodedToken.email_verified === true,
    };

    return next();
  } catch (error) {
    console.error(
      'Firebase token verification failed:',
      error.code || error.message
    );

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
}

module.exports = { verifyFirebaseToken };
