const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  _id: {
    type: String,
  },
  hash: {
    type: String,
  },
}, {
  id: false,
  shardKey: {
    _id: 1,
  },
  timestamps: { },
});

module.exports = mongoose.model('users', UserSchema);
