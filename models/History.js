const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['Add', 'Withdraw', 'Refill', 'Update', 'Delete']
  },
  quantity: {
    type: Number,
    required: true
  },
  staff: {
    type: String,
    required: true
  },
  purpose: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('History', HistorySchema);