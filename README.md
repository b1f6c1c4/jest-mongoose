# jest-mongoose

[![Appveyor Build](https://img.shields.io/appveyor/build/b1f6c1c4/jest-mongoose?style=flat-square)](https://ci.appveyor.com/project/b1f6c1c4/jest-mongoose)

> Mongoose integration test made easy and terse.

This package helps you do mongoose integration test at ease.

* Easy to use. Terse and intuitive API.
* MongoDB connection is managed by yourself.
* No giant binary dependencies like `mongodb-download`.

## Pre-requisites

This module requires Jest and Mongoose.

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
  it('should make a new user', async () => {
    // Call the function to be tested
    await createUser();
    // Check if the result is correct
    await check.User({
      _id: 'the-id',
      name: 'the-name',
    });
  });

  it('should handle duplication insertion', async () => {
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
  });
});
```

## License

MIT
