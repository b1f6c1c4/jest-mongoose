const { superMerge, mer } = require('./util');

describe('superMerge', () => {
  it('should accept zero', () => {
    expect(superMerge({ a: 1 }, [])).toEqual({ a: 1 });
  });
  it('should accept assign', () => {
    expect(superMerge({ a: 1 }, [
      { a: 2, b: 3 },
      { a: 4 },
    ])).toEqual({ a: 4, b: 3 });
  });
  it('should accept deep assign', () => {
    expect(superMerge({ a: 1, b: { c: 7 } }, [
      { b: [2], c: { d: 3 } },
    ])).toEqual({ a: 1, b: [2], c: { d: 3 } });
  });
  it('should accept string', () => {
    expect(superMerge({ a: 1 }, [
      'a', [5],
      'c.d', { e: 3 },
    ])).toEqual({ a: [5], c: { d: { e: 3 } } });
  });
  it('should accept string unset', () => {
    expect(superMerge({ a: [5, 6], c: { d: { e: 3 } } }, [
      '-c.d.e',
      '-a[0]',
    ])).toEqual({ a: [undefined, 6], c: { d: {} } });
  });
  it('should accept index string', () => {
    expect(superMerge({ a: 1 }, [
      'z[1]', { q: 1 },
      'a.b', 0,
    ])).toEqual({ a: { b: 0 }, z: [undefined, { q: 1 }] });
  });
  it('should accept array replace', () => {
    expect(superMerge({ a: 1 }, [
      { a: [1, 2] },
      { a: [[3]] },
    ])).toEqual({ a: [[3]] });
  });
});

describe('mer', () => {
  it('should use new object', () => {
    const obj = { a: 1 };
    expect(mer(obj, 'a', 2)).toEqual({ a: 2 });
    expect(mer(obj, 'b', 3)).toEqual({ a: 1, b: 3 });
    expect(mer(obj, 'c', 4)).toEqual({ a: 1, c: 4 });
  });
  it('should use new deep object', () => {
    const obj = { a: { b: 1 } };
    expect(mer(obj, 'a.b', 2)).toEqual({ a: { b: 2 } });
    expect(mer(obj, 'c', 3)).toEqual({ a: { b: 1 }, c: 3 });
  });
  it('should support array', () => {
    const obj = [1, 2, 3];
    expect(mer(obj, '[1]', 4)).toEqual([1, 4, 3]);
    expect(mer(obj, ['a'])).toEqual(['a', 2, 3]);
  });
});
