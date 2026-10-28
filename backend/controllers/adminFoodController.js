
const oracledb = require('oracledb');
const { getConnection } = require('../db');

// GET: Return every food item, including unavailable dishes.
async function getAdminFoods(req, res) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
         f.food_id AS "id",
         f.food_name AS "name",
         f.description AS "description",
         f.price AS "price",
         f.image_url AS "image",
         f.is_vegetarian AS "isVegetarian",
         f.is_available AS "isAvailable",
         f.stock_quantity AS "stockQuantity",
         f.category_id AS "categoryId",
         c.category_name AS "category"
       FROM foods f
       LEFT JOIN categories c
         ON c.category_id = f.category_id
       ORDER BY f.food_id`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      foods: result.rows,
    });
  } catch (error) {
    console.error('Failed to fetch admin foods:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch food management data.',
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
}

// PATCH: Save a food item's availability and stock quantity.
async function updateFoodInventory(req, res) {
  let connection;

  try {
    const foodId = Number(req.params.id);
    const { isAvailable, stockQuantity } = req.body;

    if (!Number.isSafeInteger(foodId) || foodId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid food ID.',
      });
    }

    if (
      ![0, 1, true, false].includes(isAvailable) ||
      !Number.isSafeInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Availability must be true/false or 1/0, and stock must be a non-negative integer.',
      });
    }

    const availableFlag =
      isAvailable === true || isAvailable === 1 ? 1 : 0;

    // Zero stock always means unavailable.
    const finalAvailability =
      stockQuantity === 0 ? 0 : availableFlag;

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE foods
       SET stock_quantity = :stockQuantity,
           is_available = :isAvailable,
           updated_at = CURRENT_TIMESTAMP
       WHERE food_id = :foodId`,
      {
        stockQuantity,
        isAvailable: finalAvailability,
        foodId,
      },
      { autoCommit: false }
    );

    if (result.rowsAffected === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: 'Food item not found.',
      });
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Food availability and stock saved.',
      food: {
        id: foodId,
        isAvailable: finalAvailability,
        stockQuantity,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Inventory rollback failed:', rollbackError.message);
      }
    }

    console.error('Failed to update food inventory:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to update food inventory.',
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
}

module.exports = {
  getAdminFoods,
  updateFoodInventory,
};
