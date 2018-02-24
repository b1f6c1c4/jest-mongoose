const mongo = require('./mongo');
const { User } = require('./models/users');
const { createUser, modifyUser } = require('./userManagement');

mongo.connect()
  .then(createUser)
  .then(modifyUser)
  .catch((e) => {
    console.error(e);
  });
