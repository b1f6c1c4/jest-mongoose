# jest-mongoose

[![Greenkeeper badge](https://badges.greenkeeper.io/b1f6c1c4/jest-mongoose.svg)](https://greenkeeper.io/)

> Mongoose integration test made easy and terse.

This package helps you do mongoose integration test at ease.

* Easy to use. Terse and intuitive API.
* MongoDB connection is managed by yourself.
* No binary dependencies (like `mongodb-download`).

## Pre-requisites

This module requires Jest and Mongoose. Mongoose 5 is supported, while Mongoose 4 has not been tested yet.

## Installation

```sh
$ npm i --save-dev jest-mongoose
```
## Usage

> For a complete working demo, see the `example` folder.

```js
const { models, make, mer, check } = require('./bundle');
const { createUser } = require('../userManagement');

describe('createUser', () => {
  it('should make a new user', async (done) => {
    // Call the function to be tested
    await createUser();
    // Check if the result is correct
    await check.User({
      _id: 'the-id',
      name: 'the-name',
    });
    done();
  });

  it('should handle duplication insertion', async (done) => {
    // Setup database records is simple
    await make.User({
      _id: 'the-id',
      name: 'my-name-is-evil',
    });
    const result = await createUser();
    // Check the return value
    expect(result).toBeInstanceOf(Error);
    // Check the previous record is intact
    await check.User({
      _id: 'the-id',
      name: 'my-name-is-evil',
    });
    done();
  });
});
```

## License

MIT
