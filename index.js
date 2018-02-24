const _ = require('lodash');
const logger = require('./logger');

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
    'aggregate',
  ];
  verbs1.forEach((verb) => {
    logger.trace('Inject hacker for schema', verb);
    model.schema.s.hooks.pre(verb, function (next) {
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
  });
  verbs2.forEach((verb) => {
    logger.trace('Inject hacker for model', verb);
    model.hooks.pre(verb, function (next) {
      logger.trace('Verb called, hack now', verb);
      const obj = _.get(toThrow, verb);
      if (obj !== undefined) {
        logger.warn('Hacked by', obj);
        if (verb !== 'aggregate') {
          expect(this.op).toEqual(verb);
        }
      }
      if (obj) {
        next(obj);
      } else {
        next();
      }
    });
  });
  return (th) => {
    toThrow = th;
  };
};

const superMerge = (base, objs) => {
  for (let i = 0; i < objs.length;) {
    const o = objs[i];
    if (typeof o === 'string') {
      if (!o.startsWith('-')) {
        const target = i < objs.length - 1 ? objs[i + 1] : undefined;
        _.set(base, o, target);
        i += 2;
      } else {
        _.unset(base, o.substr(1));
        i += 1;
      }
    } else if (typeof o === 'object') {
      _.assignIn(base, _.cloneDeep(o));
      i += 1;
    } else {
      logger.error('Super merge', o);
      i += 1;
    }
  }
  return base;
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

  const make = _.mapValues(models, (M) => async (...os) => {
    const doc = new M();
    doc.set(superMerge({}, os));
    await doc.save();
    return doc.toObject();
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

  const mer = (base, ...os) => superMerge(_.isArray(base) ? [] : {}, [base, ...os]);

  const check = _.mapValues(models, (M) => (...args) => {
    const obj = mer(...args);
    if (!obj) {
      return nullCheck(M);
    }
    if (_.isArray(obj)) {
      return multipleCheck(M, obj);
    }
    return simpleCheck(M, obj);
  });

  return {
    superMerge,
    models,
    make,
    mer,
    check,
  };
};
