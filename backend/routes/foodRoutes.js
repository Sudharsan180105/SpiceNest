
const express = require('express');
const { getAllFoods } = require('../controllers/foodController');

const router = express.Router();

// GET /api/v1/foods — retrieve all available food items
router.get('/', getAllFoods);

module.exports = router;
