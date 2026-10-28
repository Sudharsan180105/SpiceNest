
const express = require('express');
const oracledb = require('oracledb');
const { getConnection } = require('../db');
const { requireAdmin } = require('../adminAuth');

const router = express.Router();

// GET /api/v1/admin/customers
router.get('/', requireAdmin, async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
          USER_ID,
          FULL_NAME,
          EMAIL,
          PHONE,
          ACCOUNT_STATUS
       FROM USERS
       ORDER BY USER_ID DESC`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      success: true,
      customers: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Fetch admin customers failed:', error.message);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch customers.',
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Oracle connection close failed:', error.message);
      }
    }
  }
});

module.exports = router;
