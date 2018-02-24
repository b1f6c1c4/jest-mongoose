const User = require('./models/users');

const createUser = async () => {
  try {
    const user = new User();
    user._id = 'the-id';
    user.name = 'the-name';
    await user.save();
  } catch (err) {
    return err;
  }
};

const modifyUser = async ({ id, name }) => {
  try {
    const user = await User.findById(id);
    user.name = name;
    await user.save();
  } catch (err) {
    return err;
  }
};

const deleteUser = async ({ id }) => {
  try {
    const user = await User.findById(id);
    await user.remove();
  } catch (err) {
    return err;
  }
};

const aggregateUsers = async () => {
  try {
    const rst = await User.aggregate([
      {
        $group: {
          _id: '$name',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
    return rst;
  } catch (err) {
    return err;
  }
};

module.exports = {
  createUser,
  modifyUser,
  deleteUser,
  aggregateUsers,
};

