const _ = require('lodash');
const logger = require('./logger');
const { mer } = require('./merge');

const thrower = (model) => {
  logger.info('Hacking model', model.modelName);
  let toThrow = {};
  const verbs1 = [
    'save',
    'remove',
  ];
  const verbs2 = [
    'count',
    'find',
    'findOne',
    'findOneAndRemove',
    'findOneAndUpdate',
    'update',
    'replaceOne',
    'updateMany',
    'updateOne',
  ];
  verbs1.forEach((verb) => {
    logger.trace('Inject hacker for schema', verb);
    const v = `$__${verb}`;
    const raw = model.prototype[v];
    model.prototype[v] = function schemaMock(options, callback) {
      logger.trace('Verb called, hack now', verb);
      const obj = _.get(toThrow, verb);
      if (obj !== undefined) {
        logger.warn('Hacked by', obj);
        expect(verb).toEqual(verb);
      }
      if (obj) {
        callback(obj);
      } else {
        raw.call(this, options, callback);
      }
    };
  });
  verbs2.forEach((verb) => {
    logger.trace('Inject hacker for model', verb);
    const v = verb === 'update' ? '_execUpdate' : `_${verb}`;
    const raw = model.Query.prototype[v];
    model.Query.prototype[v] = function modelMock(callback) {
      logger.trace('Verb called, hack now', verb);
      const obj = _.get(toThrow, verb);
      if (obj !== undefined) {
        logger.warn('Hacked by', obj);
        expect(this.op).toEqual(verb);
      }
      if (obj) {
        callback(obj);
      } else {
        raw.call(this, callback);
      }
    };
  });
  {
    const verb = 'aggregate';
    logger.trace('Inject hacker for model', verb);
    model.hooks.pre(verb, function modelHook(next) {
      logger.trace('Verb called, hack now', verb);
      const obj = _.get(toThrow, verb);
      if (obj !== undefined) {
        logger.warn('Hacked by', obj);
        expect(verb).toEqual(verb);
      }
      if (obj) {
        next(obj);
      } else {
        next();
      }
    });
  }

  return (th) => {
    toThrow = th;
  };
};

module.exports = (models, connect) => {
  _.mapValues(models, (M) => {
    logger.info('Injecting model', M.modelName);
    M.thrower = thrower(M);
    M.checkOn = (verb) => M.thrower({
      [verb]: false,
    });
    M.throwErrOn = (verb, msg) => M.thrower({
      [verb]: new Error(msg || 'jest-mongoose Error'),
    });
  });

  const clearThrowers = () => {
    _.mapValues(models, (M) => M.thrower({}));
  };

  const clearDocuments =
    () => Promise.all(_.values(models).map((M) => M.remove()));

  if (connect) {
    beforeAll(async (done) => {
      logger.info('Connecting mongoose');
      await connect();
      done();
    });
  }

  beforeEach(async (done) => {
    expect.hasAssertions();
    await clearDocuments();
    clearThrowers();
    done();
  });

  afterAll(async (done) => {
    await clearDocuments();
    done();
  });

  const make = _.mapValues(models, (M) => async (...args) => {
    let os = mer(...args);
    const strip = !_.isArray(os);
    if (strip) {
      os = [os];
    }
    const results = await Promise.all(os.map(async (o) => {
      const doc = new M();
      doc.set(o);
      await doc.save();
      const ox = doc.toObject();
      delete ox.__v;
      delete ox.createdAt;
      delete ox.updatedAt;
      return ox;
    }));
    if (strip) {
      return results[0];
    }
    return results;
  });

  const nullCheck = async (M) => {
    const count = await M.count();
    expect(count).toEqual(0);
  };

  const simpleCheck = async (M, o) => {
    const docs = await M.find({});
    expect(docs.length).toEqual(1);
    const ox = docs[0].toObject();
    delete ox.__v;
    delete ox.createdAt;
    delete ox.updatedAt;
    expect(ox).toEqual(o);
  };

  const multipleCheck = async (M, os) => {
    if (!os.every((o) => o._id !== undefined)) {
      throw new Error('jest-mockgoose: multiple check must have _id');
    }
    const docs = await M.find({});
    const found = _.fill(Array(os.length), false);
    docs.forEach((doc) => {
      const id = os.findIndex((o) => doc._id === o._id);
      if (id === -1) {
        expect(doc).toEqual(undefined);
      } else {
        const ox = doc.toObject();
        delete ox.__v;
        delete ox.createdAt;
        delete ox.updatedAt;
        expect(ox).toEqual(os[id]);
        found[id] = true;
      }
    });
    found.forEach((f, id) => {
      if (f) return;
      expect(undefined).toEqual(os[id]);
    });
  };

  const check = _.mapValues(models, (M) => (...args) => {
    if (!args.length) {
      return nullCheck(M);
    }
    const obj = mer(...args);
    if (_.isArray(obj)) {
      return multipleCheck(M, obj);
    }
    return simpleCheck(M, obj);
  });

  return {
    models,
    make,
    mer,
    check,
  };
};
