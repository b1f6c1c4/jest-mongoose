const _ = require('lodash');
const logger = require('./logger');

function tryArrayPartial(obj, src) {
  if (_.isArray(obj) && _.isArray(src) && obj.length === src.length) {
    // DO NOT use _.values, which treats <empty item> as undefined
    const con = Object.values(src);
    // Only allow assigning one item at a time
    if (con.length === 1) {
      const id = src.indexOf(con[0]);
      if (typeof obj[id] === 'object') {
        assignIn(obj[id], con[0]);
      } else {
        obj[id] = _.clone(con[0]);
      }
      return obj;
    }
  }
  return undefined;
}

function assigner(obj, src) {
  // console.log('!');
  // console.log(obj);
  // console.log(src);
  const result = tryArrayPartial(obj, src);
  if (result) return result;
  return _.clone(src);
};

function assignIn(obj, src) {
  const result = tryArrayPartial(obj, src);
  if (result) return result;
  _.assignInWith(obj, src, assigner);
}

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
      assignIn(base, o);
      i += 1;
    } else {
      logger.error('Super merge', o);
      i += 1;
    }
  }
  return base;
};

const mer = (base, ...os) => superMerge(_.isArray(base) ? [] : {}, [base, ...os]);

module.exports = {
  superMerge,
  mer,
};
