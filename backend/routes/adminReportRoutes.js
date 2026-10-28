
const express = require('express');
const oracledb = require('oracledb');

const { requireAdmin } = require('../adminAuth');
const { getConnection } = require('../db');

const router = express.Router();

router.get('/summary', requireAdmin, async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         COUNT(*) AS TOTAL_ORDERS,
         NVL(SUM(TOTAL_AMOUNT), 0) AS TOTAL_ORDER_VALUE,
         SUM(
           CASE
             WHEN ORDER_STATUS = 'DELIVERED'
              AND PAYMENT_STATUS = 'PAID'
             THEN 1 ELSE 0
           END
         ) AS COMPLETED_ORDERS,
         NVL(
           AVG(TOTAL_AMOUNT),
           0
         ) AS AVERAGE_ORDER_VALUE,
         SUM(
           CASE
             WHEN PAYMENT_STATUS = 'PENDING'
             THEN 1 ELSE 0
           END
         ) AS PENDING_PAYMENTS,
         SUM(
           CASE
             WHEN ORDER_STATUS = 'CANCELLED'
             THEN 1 ELSE 0
           END
         ) AS CANCELLED_ORDERS
       FROM ORDERS`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const dailyResult = await connection.execute(
      `SELECT
         TRUNC(ORDER_DATE) AS SALES_DATE,
         COUNT(*) AS ORDER_COUNT,
         NVL(SUM(TOTAL_AMOUNT), 0) AS DAILY_ORDER_VALUE
       FROM ORDERS
       WHERE ORDER_DATE >= TRUNC(SYSDATE) - 6
         AND ORDER_DATE < TRUNC(SYSDATE) + 1
       GROUP BY TRUNC(ORDER_DATE)
       ORDER BY TRUNC(ORDER_DATE)`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.json({
      success: true,
      summary: result.rows[0],
      dailySales: dailyResult.rows,
    });
  } catch (error) {
    console.error('Admin reports retrieval failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to load restaurant reports.',
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
