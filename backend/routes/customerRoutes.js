
const express = require('express');
const { verifyFirebaseToken } = require('../firebaseAuth');
const { getConnection } = require('../db');

const router = express.Router();

// Create or update the signed-in customer's Oracle profile.
router.post('/profile/sync', verifyFirebaseToken, async (req, res) => {
  const firebaseUser = req.firebaseUser;
  let connection;

  try {
    const email = String(firebaseUser.email || '')
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'A verified email address is required.',
      });
    }

    const fullName = String(
      req.body.fullName || firebaseUser.name || ''
    ).trim();

    const phone = String(req.body.phone || '').trim() || null;

    connection = await getConnection();

    await connection.execute(
      `MERGE INTO USERS target
       USING (
         SELECT :email AS EMAIL FROM DUAL
       ) source
       ON (LOWER(target.EMAIL) = source.EMAIL)
       WHEN MATCHED THEN
         UPDATE SET
           target.FULL_NAME = COALESCE(:fullName, target.FULL_NAME),
           target.PHONE = COALESCE(:phone, target.PHONE),
           target.UPDATED_AT = SYSTIMESTAMP
       WHEN NOT MATCHED THEN
         INSERT (
           EMAIL,
           FULL_NAME,
           PHONE,
           ACCOUNT_STATUS,
           CREATED_AT,
           UPDATED_AT
         )
         VALUES (
           :email,
           :fullName,
           :phone,
           'ACTIVE',
           SYSTIMESTAMP,
           SYSTIMESTAMP
         )`,
      {
        email,
        fullName: fullName || null,
        phone,
      },
      { autoCommit: true }
    );

    const result = await connection.execute(
      `SELECT USER_ID, EMAIL, FULL_NAME, PHONE, ACCOUNT_STATUS
       FROM USERS
       WHERE LOWER(EMAIL) = :email`,
      { email },
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      message: 'Customer profile synchronized.',
      customer: result.rows[0] || null,
    });
  } catch (error) {
    console.error('Customer profile sync failed:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to synchronize the customer profile.',
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Failed to close Oracle connection:', error.message);
      }
    }
  }
});

// Read the signed-in customer's Oracle profile.
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  const email = String(req.firebaseUser.email || '')
    .trim()
    .toLowerCase();

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'A verified email address is required.',
    });
  }

  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT USER_ID, EMAIL, FULL_NAME, PHONE, ACCOUNT_STATUS
       FROM USERS
       WHERE LOWER(EMAIL) = :email`,
      { email },
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found. Please sign in again.',
      });
    }

    return res.status(200).json({
      success: true,
      customer: result.rows[0],
    });
  } catch (error) {
    console.error('Customer profile read failed:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve the customer profile.',
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Failed to close Oracle connection:', error.message);
      }
    }
  }
});

module.exports = router;
