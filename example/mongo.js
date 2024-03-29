const mongoose = require('mongoose');

module.exports.connect = () => new Promise((resolve, reject) => {
  const host = process.env.MONGO_HOST || 'localhost';
  const dbName = 'jest-mongoose-demo';

  mongoose.connection.on('connected', () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Mongodb connected!');
    }
    resolve();
  });

  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Connecting ${host}/${dbName}`);
    }
    mongoose.connect(`mongodb://${host}/${dbName}`).then(resolve, reject);
  } catch (e) {
    reject(e);
  }
});

module.exports.disconnect = mongoose.disconnect;
