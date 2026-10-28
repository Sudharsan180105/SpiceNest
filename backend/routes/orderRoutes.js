
const express = require('express');
const oracledb = require('oracledb');
const { getConnection } = require('../db');
const { verifyFirebaseToken } = require('../firebaseAuth');
const { requireAdmin } = require('../adminAuth');

const router = express.Router();

const VALID_PAYMENT_METHODS = ['COD'];
const VALID_ORDER_STATUSES = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

async function getLocalUserId(connection, firebaseUser) {
  const result = await connection.execute(
    `SELECT USER_ID, ACCOUNT_STATUS
       FROM USERS
      WHERE FIREBASE_UID = :firebaseUid`,
    { firebaseUid: firebaseUser.uid },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (!result.rows.length) {
    const error = new Error(
      'Customer profile not found. Please sign in again.'
    );
    error.status = 403;
    throw error;
  }

  if (result.rows[0].ACCOUNT_STATUS !== 'ACTIVE') {
    const error = new Error('Your SpiceNest account is not active.');
    error.status = 403;
    throw error;
  }

  return result.rows[0].USER_ID;
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    const error = new Error('Add between 1 and 50 food items to your order.');
    error.status = 400;
    throw error;
  }

  const quantities = new Map();

  for (const item of items) {
    const foodId = Number(item.foodId ?? item.id);
    const quantity = Number(item.quantity);

    if (
      !Number.isSafeInteger(foodId) ||
      foodId <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      const error = new Error('An order item or quantity is invalid.');
      error.status = 400;
      throw error;
    }

    quantities.set(foodId, (quantities.get(foodId) || 0) + quantity);
  }

  for (const quantity of quantities.values()) {
    if (quantity > 99) {
      const error = new Error('Maximum quantity per food item is 99.');
      error.status = 400;
      throw error;
    }
  }

  return [...quantities.entries()].map(([foodId, quantity]) => ({
    foodId,
    quantity,
  }));
}

/**
 * POST /api/v1/orders
 * Create an Oracle-backed customer order.
 *
 * Body:
 * {
 *   "items": [{"foodId": 1, "quantity": 2}],
 *   "paymentMethod": "COD",
 *   "deliveryAddress": "Full delivery address"
 * }
 */
router.post('/', verifyFirebaseToken, async (req, res) => {
  let connection;
  let transactionComplete = false;

  try {
    const items = normalizeItems(req.body?.items);

    const paymentMethod = String(
      req.body?.paymentMethod || 'COD'
    ).trim().toUpperCase();

    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message:
          'Only Cash on Delivery is currently supported. Online payments are not enabled.',
      });
    }

    const deliveryAddress = String(
      req.body?.deliveryAddress || ''
    ).trim();

    if (!deliveryAddress || deliveryAddress.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid delivery address (maximum 1000 characters).',
      });
    }

    connection = await getConnection();

    const userId = await getLocalUserId(connection, req.firebaseUser);

    const foodIds = items.map((item) => item.foodId);
    const binds = {};
    const placeholders = foodIds.map((id, index) => {
      binds[`foodId${index}`] = id;
      return `:foodId${index}`;
    });

    const foodResult = await connection.execute(
      `SELECT FOOD_ID, FOOD_NAME, PRICE
         FROM FOODS
        WHERE IS_AVAILABLE = 1
          AND FOOD_ID IN (${placeholders.join(', ')})`,
      binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const foodById = new Map(
      foodResult.rows.map((food) => [Number(food.FOOD_ID), food])
    );

    if (foodById.size !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected foods are unavailable. Refresh the menu and try again.',
      });
    }

    const DELIVERY_FEE = 40;

let subtotal = 0;

const orderItems = items.map((item) => {
  const food = foodById.get(item.foodId);
  const unitPrice = Number(food.PRICE);

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new Error(`Invalid database price for food ${item.foodId}.`);
  }

  subtotal += unitPrice * item.quantity;

  return {
    foodId: item.foodId,
    quantity: item.quantity,
    unitPrice,
  };
});

const deliveryFee = DELIVERY_FEE;
const totalAmount = subtotal + deliveryFee;

if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
  return res.status(400).json({
    success: false,
    message: 'The order total is invalid.',
  });
}
    const orderResult = await connection.execute(
      `INSERT INTO ORDERS (
         ORDER_ID,
         USER_ID,
         ORDER_DATE,
         TOTAL_AMOUNT,
         ORDER_STATUS,
         PAYMENT_METHOD,
         PAYMENT_STATUS,
         DELIVERY_ADDRESS
       ) VALUES (
         (SELECT NVL(MAX(ORDER_ID), 0) + 1 FROM ORDERS),
         :userId,
         CURRENT_TIMESTAMP,
         :totalAmount,
         'PLACED',
         :paymentMethod,
         'PENDING',
         :deliveryAddress
       )
       RETURNING ORDER_ID INTO :orderId`,
      {
        userId,
        totalAmount,
        paymentMethod,
        deliveryAddress,
        orderId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false }
    );

    const orderId = Number(orderResult.outBinds.orderId[0]);

    for (const item of orderItems) {
      await connection.execute(
        `INSERT INTO ORDER_ITEMS (
           ORDER_ITEM_ID,
           ORDER_ID,
           FOOD_ID,
           QUANTITY,
           UNIT_PRICE
         ) VALUES (
           (SELECT NVL(MAX(ORDER_ITEM_ID), 0) + 1 FROM ORDER_ITEMS),
           :orderId,
           :foodId,
           :quantity,
           :unitPrice
         )`,
        {
          orderId,
          foodId: item.foodId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        },
        { autoCommit: false }
      );
    }

    await connection.commit();
    transactionComplete = true;

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order: {
        orderId,
        orderDate: new Date().toISOString(),
        totalAmount,
        orderStatus: 'PLACED',
        paymentMethod,
        paymentStatus: 'PENDING',
        deliveryAddress,
        items: orderItems.map((item) => ({
          foodId: item.foodId,
          foodName: foodById.get(item.foodId).FOOD_NAME,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.unitPrice * item.quantity,
        })),
      },
    });
  } catch (error) {
    if (connection && !transactionComplete) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Order rollback failed:', rollbackError.message);
      }
    }

    console.error('Create order failed:', error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.status
        ? error.message
        : 'Unable to place the order. No order was confirmed.',
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

/**
 * GET /api/v1/orders
 * Get the signed-in customer's orders and their items.
 */
router.get('/', verifyFirebaseToken, async (req, res) => {
  let connection;

  try {
    connection = await getConnection();
    const userId = await getLocalUserId(connection, req.firebaseUser);

    const result = await connection.execute(
      `SELECT
         o.ORDER_ID,
         o.ORDER_DATE,
         o.TOTAL_AMOUNT,
         o.ORDER_STATUS,
         o.PAYMENT_METHOD,
         o.PAYMENT_STATUS,
         o.DELIVERY_ADDRESS,
         oi.ORDER_ITEM_ID,
         oi.FOOD_ID,
         f.FOOD_NAME,
         f.IMAGE_URL,
         oi.QUANTITY,
         oi.UNIT_PRICE
       FROM ORDERS o
       LEFT JOIN ORDER_ITEMS oi ON oi.ORDER_ID = o.ORDER_ID
       LEFT JOIN FOODS f ON f.FOOD_ID = oi.FOOD_ID
       WHERE o.USER_ID = :userId
       ORDER BY o.ORDER_DATE DESC, o.ORDER_ID DESC, oi.ORDER_ITEM_ID`,
      { userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const ordersById = new Map();

    for (const row of result.rows) {
      const id = Number(row.ORDER_ID);

      if (!ordersById.has(id)) {
        ordersById.set(id, {
          orderId: id,
          orderDate: row.ORDER_DATE,
          totalAmount: Number(row.TOTAL_AMOUNT),
          orderStatus: row.ORDER_STATUS,
          paymentMethod: row.PAYMENT_METHOD,
          paymentStatus: row.PAYMENT_STATUS,
          deliveryAddress: row.DELIVERY_ADDRESS,
          items: [],
        });
      }

      if (row.ORDER_ITEM_ID != null) {
        ordersById.get(id).items.push({
          orderItemId: Number(row.ORDER_ITEM_ID),
          foodId: Number(row.FOOD_ID),
          foodName: row.FOOD_NAME,
          image: row.IMAGE_URL,
          quantity: Number(row.QUANTITY),
          unitPrice: Number(row.UNIT_PRICE),
          lineTotal: Number(row.QUANTITY) * Number(row.UNIT_PRICE),
        });
      }
    }

    return res.json({
      success: true,
      orders: [...ordersById.values()],
    });
  } catch (error) {
    console.error('Fetch customer orders failed:', error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : 'Unable to fetch your orders.',
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

/**
 * GET /api/v1/orders/admin
 * Get all orders for authorized administrators.
 */
router.get('/admin', requireAdmin, async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         o.ORDER_ID,
         o.USER_ID,
         u.FULL_NAME,
         u.EMAIL,
         u.PHONE,
         o.ORDER_DATE,
         o.TOTAL_AMOUNT,
         o.ORDER_STATUS,
         o.PAYMENT_METHOD,
         o.PAYMENT_STATUS,
         o.DELIVERY_ADDRESS
       FROM ORDERS o
       JOIN USERS u ON u.USER_ID = o.USER_ID
       ORDER BY o.ORDER_DATE DESC, o.ORDER_ID DESC`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.json({
      success: true,
      orders: result.rows,
    });
  } catch (error) {
    console.error('Fetch admin orders failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch orders for administration.',
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

/**
 * PATCH /api/v1/orders/admin/:orderId/status
 * Update an order status for authorized administrators.
 */

router.patch('/admin/:orderId/status', requireAdmin, async (req, res) => {
  let connection;

  try {
    const orderId = Number(req.params.orderId);
    const status = String(req.body?.status || '').trim().toUpperCase();

    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.',
      });
    }

    if (!VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_ORDER_STATUSES.join(', ')}.`,
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE ORDERS
          SET ORDER_STATUS = :status,
              PAYMENT_STATUS = CASE
                WHEN :status = 'DELIVERED'
                 AND PAYMENT_METHOD = 'COD'
                THEN 'PAID'
                ELSE PAYMENT_STATUS
              END
        WHERE ORDER_ID = :orderId`,
      { status, orderId },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Order status updated successfully.',
      orderId,
      status,
    });
  } catch (error) {
    console.error('Update order status failed:', error);

    return res.status(error.errorNum === 2290 ? 400 : 500).json({
      success: false,
      message:
        error.errorNum === 2290
          ? 'This status is not permitted by the database.'
          : 'Unable to update order status.',
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

router.patch('/admin/:orderId/payment', requireAdmin, async (req, res) => {
  let connection;

  try {
    const orderId = Number(req.params.orderId);

    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.',
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE ORDERS
          SET PAYMENT_STATUS = 'PAID'
        WHERE ORDER_ID = :orderId
          AND ORDER_STATUS = 'DELIVERED'
          AND PAYMENT_METHOD = 'COD'
          AND PAYMENT_STATUS = 'PENDING'`,
      { orderId },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      const check = await connection.execute(
        `SELECT ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS
           FROM ORDERS
          WHERE ORDER_ID = :orderId`,
        { orderId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!check.rows || check.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
        });
      }

      return res.status(400).json({
        success: false,
        message:
          'Only delivered COD orders with pending payment can be marked as paid.',
      });
    }

    return res.json({
      success: true,
      message: 'Payment marked as received.',
      orderId,
      paymentStatus: 'PAID',
    });
  } catch (error) {
    console.error('Mark payment received failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to update payment status.',
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
