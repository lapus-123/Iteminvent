const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const History = require('../models/History');

// @route   GET /api/history
// @desc    Get all history logs
router.get('/', auth, async (req, res) => {
  try {
    // Get last 100 entries sorted by date
    const history = await History.find()
      .sort({ date: -1 })
      .limit(100)
      .populate('item', 'name'); // Populate item name

    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/history/:itemId
// @desc    Get history for specific item
router.get('/item/:itemId', auth, async (req, res) => {
  try {
    const history = await History.find({ item: req.params.itemId })
      .sort({ date: -1 })
      .populate('item', 'name');

    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;