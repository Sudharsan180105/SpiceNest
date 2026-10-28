
const express = require('express');
const {
  getAdminFoods,
  updateFoodInventory,
} = require('../controllers/adminFoodController');
const { requireAdmin } = require('../adminAuth');

const router = express.Router();

// GET /api/v1/admin/foods — retrieve all foods, including unavailable ones.
router.get('/', requireAdmin, getAdminFoods);

// PATCH /api/v1/admin/foods/:id/inventory — update stock and availability.
router.patch('/:id/inventory', requireAdmin, updateFoodInventory);

module.exports = router;
