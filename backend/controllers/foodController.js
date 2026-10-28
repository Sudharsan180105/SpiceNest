
const oracledb = require('oracledb');
const { getConnection } = require('../db');

async function getAllFoods(req, res) {
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
         c.category_name AS "category"
       FROM foods f
       JOIN categories c
         ON c.category_id = f.category_id
       WHERE f.is_available = 1
       ORDER BY f.food_id`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      foods: result.rows,
    });
  } catch (error) {
    console.error('Failed to fetch foods:', error.message);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch the food menu.',
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

module.exports = { getAllFoods };
