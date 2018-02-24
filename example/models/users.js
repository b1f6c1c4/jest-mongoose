const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    default: 'default-name',
  },
}, {
  id: false,
});

module.exports = mongoose.model('users', UserSchema);
