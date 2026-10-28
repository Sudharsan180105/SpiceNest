
require('dotenv').config({
  path: require('path').join(__dirname, '.env'),
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const oracledb = require('oracledb');

const { verifyFirebaseToken } = require('./firebaseAuth');
const { requireAdmin } = require('./adminAuth');

const {
  initializeDatabase,
  getConnection,
  closeDatabase,
} = require('./db');

const foodRoutes = require('./routes/foodRoutes');
const adminFoodRoutes = require('./routes/adminFoodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminCustomerRoutes = require('./routes/adminCustomerRoutes');
const adminReportRoutes = require('./routes/adminReportRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);

  res.on('finish', () => {
    console.log(
      `[RESPONSE] ${req.method} ${req.originalUrl} ${res.statusCode}`
    );
  });

  next();
});

app.use(helmet());

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
  })
);

app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SpiceNest API is running',
    timestamp: new Date().toISOString(),
  });
});

// Firebase authentication check
app.get('/api/v1/auth/me', verifyFirebaseToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.firebaseUser,
  });
});

// Admin authorization check
app.get('/api/v1/admin/access-check', requireAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin authorization successful.',
    admin: {
      uid: req.firebaseUser.uid,
      email: req.firebaseUser.email,
    },
  });
});

// Customer profile synchronization
app.post(
  '/api/v1/customers/profile/sync',
  verifyFirebaseToken,
  async (req, res) => {
    let connection;

    try {
      const firebaseUser = req.firebaseUser;

      if (!firebaseUser?.uid || !firebaseUser?.email) {
        return res.status(400).json({
          success: false,
          message: 'A valid Firebase user and email are required.',
        });
      }

      const firebaseUid = firebaseUser.uid;
      const email = String(firebaseUser.email).trim().toLowerCase();

      const fullName = String(
        req.body?.fullName ||
          req.body?.displayName ||
          firebaseUser.name ||
          email.split('@')[0]
      )
        .trim()
        .slice(0, 150);

      const phone =
        String(req.body?.phone || '').trim().slice(0, 30) || null;

      connection = await getConnection();

      // Match the account by Firebase UID or an existing email record.
      // IMPORTANT: Do not update FIREBASE_UID in WHEN MATCHED.
      // Oracle prohibits updating columns referenced in the MERGE ON clause.
      await connection.execute(
        `MERGE INTO USERS u
         USING (
           SELECT
             :firebaseUid AS FIREBASE_UID,
             :email AS EMAIL
           FROM DUAL
         ) s
         ON (
           u.FIREBASE_UID = s.FIREBASE_UID
           OR (
             u.FIREBASE_UID IS NULL
             AND LOWER(u.EMAIL) = s.EMAIL
           )
         )
         WHEN MATCHED THEN
           UPDATE SET
             u.EMAIL = s.EMAIL,
             u.FULL_NAME = :fullName,
             u.PHONE = COALESCE(:phone, u.PHONE),
             u.UPDATED_AT = CURRENT_TIMESTAMP
         WHEN NOT MATCHED THEN
           INSERT (
             FIREBASE_UID,
             EMAIL,
             FULL_NAME,
             PHONE,
             ACCOUNT_STATUS
           )
           VALUES (
             s.FIREBASE_UID,
             s.EMAIL,
             :fullName,
             :phone,
             'ACTIVE'
           )`,
        {
          firebaseUid,
          email,
          fullName,
          phone,
        },
        {
          autoCommit: true,
        }
      );

      const result = await connection.execute(
        `SELECT
           USER_ID,
           FIREBASE_UID,
           FULL_NAME,
           EMAIL,
           PHONE,
           ACCOUNT_STATUS,
           CREATED_AT
         FROM USERS
         WHERE FIREBASE_UID = :firebaseUid`,
        { firebaseUid },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error(
          'Customer record was not returned after synchronization.'
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Customer profile synchronized successfully.',
        customer: result.rows[0],
      });
    } catch (error) {
      console.error('Customer profile sync failed:', error);

      return res.status(500).json({
        success: false,
        message: 'Unable to synchronize customer profile.',
        code: error.code || 'UNKNOWN_ERROR',
      });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error('Oracle connection close failed:', error);
        }
      }
    }
  }
);

// Retrieve the signed-in customer's profile
app.get(
  '/api/v1/customers/profile',
  verifyFirebaseToken,
  async (req, res) => {
    let connection;

    try {
      const firebaseUid = req.firebaseUser?.uid;

      if (!firebaseUid) {
        return res.status(401).json({
          success: false,
          message: 'A valid Firebase user is required.',
        });
      }

      connection = await getConnection();

      const result = await connection.execute(
        `SELECT
           USER_ID,
           FIREBASE_UID,
           FULL_NAME,
           EMAIL,
           PHONE,
           ACCOUNT_STATUS,
           CREATED_AT
         FROM USERS
         WHERE FIREBASE_UID = :firebaseUid`,
        { firebaseUid },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer profile not found.',
        });
      }

      return res.status(200).json({
        success: true,
        customer: result.rows[0],
      });
    } catch (error) {
      console.error('Customer profile retrieval failed:', error);

      return res.status(500).json({
        success: false,
        message: 'Unable to retrieve customer profile.',
        code: error.code || 'UNKNOWN_ERROR',
      });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error('Oracle connection close failed:', error);
        }
      }
    }
  }
);

// Other API routes
app.use('/api/v1/foods', foodRoutes);
app.use('/api/v1/admin/foods', adminFoodRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin/customers', adminCustomerRoutes);
app.use('/api/v1/admin/reports', adminReportRoutes);
app.use('/api/v1/contact', contactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

let server;
let isShuttingDown = false;

async function startServer() {
  try {
    await initializeDatabase();

    server = app.listen(PORT, () => {
      console.log(`SpiceNest API running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(
        `Customer sync: POST http://localhost:${PORT}/api/v1/customers/profile/sync`
      );
      console.log(
        `Customer profile: GET http://localhost:${PORT}/api/v1/customers/profile`
      );
      console.log(`Listening port: ${PORT}`);
    });

    server.on('error', (error) => {
      console.error('SpiceNest HTTP server error:', error);
    });
  } catch (error) {
    console.error('SpiceNest backend startup failed:', error);

    try {
      await closeDatabase();
    } catch (closeError) {
      console.error('Oracle pool cleanup failed:', closeError);
    }

    process.exitCode = 1;
  }
}

async function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('\nShutting down SpiceNest backend...');

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  try {
    await closeDatabase();
  } catch (error) {
    console.error('Oracle pool shutdown failed:', error);
    process.exitCode = 1;
  }

  process.exit(process.exitCode || 0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
