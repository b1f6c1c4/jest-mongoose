const mongoose = require('mongoose');

module.exports.connect = () => new Promise((resolve, reject) => {
  const host = process.env.MONGO_HOST || 'localhost';
  const dbName = 'jest-mongoose-demo';

  mongoose.connection.on('connected', () => {
    console.log('Mongodb connected!');
    resolve();
  });

  try {
    console.log(`Connecting ${host}/${dbName}`);
    mongoose.connect(`mongodb://${host}:27017/${dbName}`, {
      autoReconnect: true,
      reconnectTries: 0,
      reconnectInterval: 100,
    }).then(resolve, reject);
  } catch (e) {
    reject(e);
  }
});
