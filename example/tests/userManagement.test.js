// Import your custom mongoose bundle
const { models, make, mer, check } = require('./bundle');

// Import the module to be tested
const {
  createUser,
  modifyUser,
  deleteUser,
  aggregateUsers,
} = require('../userManagement');

describe('createUser', () => {
  // Be sure to use `async (done)` every where!
  it('should make a new user', async (done) => {
    // Call the function to be tested
    await createUser();
    // Check if the result is correct
    await check.User({
      _id: 'the-id',
      name: 'the-name',
    });
    // NEVER forget to call done()
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

  it('should handle error', async (done) => {
    // Tell jest-mongoose to throw an error
    models.User.throwErrOn('save');
    const res = await createUser();
    expect(res).toBeInstanceOf(Error);
    // Check if the error is _the_ error
    expect(res.message).toEqual('jest-mongoose Error');
    done();
  });

  it('should handle error custom', async (done) => {
    // You can customize the error message, of course!
    models.User.throwErrOn('save', 'funny');
    const res = await createUser();
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toEqual('funny');
    done();
  });

  it('should make another user', async (done) => {
    await make.User({ _id: 'another' });
    await createUser();
    // Check against two records!
    await check.User([{
      _id: 'the-id',
      name: 'the-name',
    }, {
      _id: 'another',
      name: 'default-name', // Don't forget this!
    }]);
    done();
  });
});

describe('modifyUser', () => {
  // Specify the default record here to reduce duplication
  const dUser = {
    _id: 'some-id',
    name: 'some-name',
  };
  // Specify the default arguments to be passed
  const dArgs = {
    id: 'some-id',
    name: 'new-name',
  };

  it('should handle normal case', async (done) => {
    await make.User(dUser);
    await modifyUser(dArgs);
    // Look at the syntax here!
    await check.User(dUser, 'name', 'new-name');
    done();
  });

  it('should handle not found case 1', async (done) => {
    await make.User(dUser);
    // It's also possible to use this syntax in your logic
    await modifyUser(mer(dArgs, 'id', 'non-exist'));
    await check.User(dUser);
    done();
  });

  it('should handle not found case 2', async (done) => {
    // make.* also accept that syntax
    await make.User(dUser, '_id', 'evil-id');
    await modifyUser(dArgs);
    // Don't forget to adjust check.*, or the test will fail
    await check.User(dUser, '_id', 'evil-id');
    // Uncomment the following line and see the difference
    // await check.User(dUser);
    done();
  });

  it('should handle normal case 2', async (done) => {
    // You may use the return value of make.*
    const setup = await make.User([dUser, { _id: 'another-id' }]);
    await modifyUser(dArgs);
    await check.User(setup, '[0].name', 'new-name');
    // Equivalent to
    await check.User(setup, [
      { name: 'new-name' },
      , // This comma is REQUIRED!
    ]);
    done();
  });
});

describe('deleteUser', () => {
  const dUser = { _id: 'id', name: 'nm' };

  it('should delete an existing user', async (done) => {
    await make.User(dUser);
    await deleteUser({ id: 'id' });
    // Either will be ok
    await check.User();
    await check.User([]);
    done();
  });
});

describe('aggregateUsers', () => {
  const dUsers = [
    { _id: '1', name: 'Alice' },
    { _id: '2', name: 'Alice' },
    { _id: '3', name: 'Bob' },
    { _id: '4', name: 'Bob' },
    { _id: '5', name: 'Bob' },
  ];

  it('should aggregate', async (done) => {
    await make.User(dUsers);
    const result = await aggregateUsers();
    expect(result).toEqual([
      { _id: 'Bob', count: 3 },
      { _id: 'Alice', count: 2 },
    ]);
    done();
  });
});
