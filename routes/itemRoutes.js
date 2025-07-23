const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Item = require('../models/Item');
const Category = require('../models/Category');
const History = require('../models/History');

// Add new item
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('category', 'Category is required').not().isEmpty(),
      check('quantity', 'Quantity must be a positive number').isInt({ min: 0 }),
      check('threshold', 'Threshold must be a positive number').isInt({ min: 0 }),
      check('staff', 'Staff name is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, category, quantity, threshold, staff } = req.body;

    try {
      // Check if category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ msg: 'Category not found' });
      }

      const newItem = new Item({
        name,
        category,
        quantity,
        threshold
      });

      const item = await newItem.save();

      // Add to history
      const history = new History({
        item: item._id,
        action: 'Add',
        quantity: item.quantity,
        staff,
        purpose: 'New item added'
      });

      await history.save();

      res.json(item);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }

  }
);
module.exports = router;

// Implement other routes: GET, PUT, DELETE, refill, withdraw, etc.