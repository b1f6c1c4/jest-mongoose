const mongo = require('./mongo');
const {
  createUser,
  modifyUser,
  deleteUser,
  aggregateUsers,
} = require('./userManagement');

mongo.connect()
  .then(() => {
    // you may setup express.js here
    // and call functions /.*Users?/
    // in express request handlers.
    console.log('Hello world!');
  })
  .catch((e) => {
    console.error(e);
  });
