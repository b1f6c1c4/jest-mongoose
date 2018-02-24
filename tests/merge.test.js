const { superMerge, mer } = require('../merge');

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
    ])).toEqual({ a: [, 6], c: { d: {} } });
  });
  it('should accept index string', () => {
    expect(superMerge({ a: 1 }, [
      'z[1]', { q: 1 },
      'a.b', 0,
    ])).toEqual({ a: { b: 0 }, z: [, { q: 1 }] });
  });
  it('should accept array replace', () => {
    expect(superMerge({ a: 1 }, [
      { a: [1, 2] },
      { a: [[3]] },
    ])).toEqual({ a: [[3]] });
  });
  it('should accept array partial replace', () => {
    expect(superMerge({ a: [1, 5, 7], b: [1, 2], c: [4, 5, 6] }, [
      { a: [3, ], b: [, 5], c: [7, , 9] },
    ])).toEqual({ a: [3, ], b: [1, 5], c: [7, , 9] });
  });
  it('should accept array partial replace object', () => {
    expect(superMerge({ b: [1, { x: 1, y: 2 }] }, [
      { b: [, { x: 2 }] },
    ])).toEqual({ b: [1, { x: 2, y: 2 }] });
  });
  it('should accept array partial replace twice', () => {
    expect(superMerge({ a: [1, 5, [1, 2]] }, [
      { a: [3, , , ] }, // Mind the trailing comma
      { a: [, , [, 5]] },
    ])).toEqual({ a: [3, 5, [1, 5]] });
  });
  it('should accept global array', () => {
    expect(superMerge([1, { x: 1, y: 2 }], [
      [123, { x: 2 }],
    ])).toEqual([123, { x: 2 }]);
  });
  it('should accept global array 2', () => {
    expect(superMerge([1, { x: 1, y: 2 }], [
      [123, { x: 2 }, 'evil'],
    ])).toEqual([123, { x: 2 }, 'evil']);
  });
  it('should accept global array partial replace', () => {
    expect(superMerge([1, { x: 1, y: 2 }], [
      [, { x: 2 }],
    ])).toEqual([1, { x: 2, y: 2 }]);
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
  it('should use new deep object for array partial replace', () => {
    const base = { a: [1, 2, 3] };
    const obj = { a: [, , { b: 1 }] };
    expect(mer(base, obj, 'a.[2].b', 2)).toEqual({ a: [1, 2, { b: 2 }]});
    expect(mer(base, obj, 'a.[1]', 3)).toEqual({ a: [1, 3, { b: 1 }]});
  });
  it('should support array', () => {
    const obj = [1, 2, 3];
    expect(mer(obj, '[1]', 4)).toEqual([1, 4, 3]);
    expect(mer(obj, ['a'])).toEqual(['a', 2, 3]);
  });
});
