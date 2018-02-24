// Notice: Be sure to **EXCLUDE** this file from jest
// since this is not actually tests!

// Import all your models here
const User = require('../models/users');

// Import jest-mongoose
// const jestMongoose = require('jest-mongoose');
const jestMongoose = require('../../');

// Import db initialization
const { connect } = require('../mongo');

// Magic!
module.exports = jestMongoose({
  User,
}, connect);
