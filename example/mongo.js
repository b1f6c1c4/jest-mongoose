const mongoose = require('mongoose');

module.exports.connect = () => new Promise((resolve, reject) => {
  const host = process.env.MONGO_HOST || 'localhost';
  const dbName = 'jest-mongoose-demo';

  mongoose.set('useNewUrlParser', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useUnifiedTopology', true);

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
    mongoose.connect(`mongodb://${host}:27017/${dbName}`).then(resolve, reject);
  } catch (e) {
    reject(e);
  }
});
