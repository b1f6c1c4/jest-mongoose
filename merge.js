const _ = require('lodash');
const logger = require('./logger');

function preserveEmpty(obj) {
  if (_.isArray(obj)) {
    const n = Array(obj.length);
    obj.forEach((o, i) => n[i] = cloneDeep(o));
    return n;
  }
  return undefined;
};

function cloneDeep(obj) {
  return _.cloneDeepWith(obj, preserveEmpty);
}

function tryArrayPartial(obj, src) {
  // console.log(obj);
  // console.log(src);
  if (_.isArray(obj) && _.isArray(src)) {
    if (obj.length === src.length) {
      // DO NOT use _.values, which treats <empty item> as undefined
      const con = Object.values(src);
      // Only allow assigning one item at a time
      if (con.length === 1) {
        const id = src.indexOf(con[0]);
        if (typeof obj[id] === 'object') {
          assignIn(obj[id], con[0]);
        } else {
          obj[id] = con[0];
        }
        return obj;
      }
    }
    obj.splice(0, obj.length);
    src.forEach((o, i) => obj[i] = o);
    return obj;
  }
  return undefined;
}

function assignIn(obj, src) {
  // console.log('assignIn');
  const result = tryArrayPartial(obj, src);
  if (result) return result;
  _.assignInWith(obj, src, tryArrayPartial);
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
      assignIn(base, cloneDeep(o));
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
