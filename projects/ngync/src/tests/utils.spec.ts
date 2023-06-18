import { deepClone, deepCloneJSON, deepEqual, findProps, getValue, intersection, iterable, prop, setValue } from '../lib/shared/utils';
describe('utils', () => {
  it('should get value', () => {
    let obj1 = { a: { b: { c: 1 } } };
    let obj2 = { a: { b: [{c: 1}] } };
    let obj3 = { a: [{ b: { c: 1 } }] };
    let obj4 = [ { b: { c: 1 } } ];

    expect(getValue(obj1, 'a.b.c')).toEqual(1);
    expect(getValue(obj2, 'a.b.0.c')).toEqual(1);
    expect(getValue(obj3, 'a.0.b.c')).toEqual(1);
    expect(getValue(obj4, '0.b.c')).toEqual(1);
  });

  it('should set value', () => {
    let obj1 = { a: { b: { c: 1 } } };
    let obj2 = { a: { b: [{c: 1}] } };
    let obj3 = { a: [{ b: { c: 1 } }] };
    let obj4 = [ { b: { c: 1 } } ];

    expect(getValue(setValue(obj1, 'a.b.c', 2), 'a.b.c')).toEqual(2);
    expect(getValue(setValue(obj2, 'a.b.0.c', 2), 'a.b.0.c')).toEqual(2);
    expect(getValue(setValue(obj3, 'a.0.b.c', 2), 'a.0.b.c')).toEqual(2);
    expect(getValue(setValue(obj4, '0.b.c', 2), '0.b.c')).toEqual(2);
  });

  it('should iterate', () => {
    let obj = { a: 1, b: 2, c: 3 };
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    expect([...iterable(obj)]).toEqual([1, 2, 3]);
    expect([...iterable(arr)]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('should get prop', () => {
    type Obj = { a: number; b: number; c: number; d: {a : number; b: number[]} }
    let obj: Obj = { a: 1, b: 2, c: 3, d: { a : 1, b: [1, 2, 3]} };

    expect(prop<Obj>(x => x.a)).toEqual('a');
    expect(prop<Obj>(x => x.b)).toEqual('b');
    expect(prop<Obj>(x => x.c)).toEqual('c');
    expect(prop<Obj>(x => x.d.a)).toEqual('d.a');
    expect(prop<Obj>(x => x.d.b[0])).toEqual('d.b.0');
  });

  it('should find props', () => {
    let obj = { a: 1, b: 2, c: 3, d: { a : 1, b: [1, 2, 3]} };

    expect(findProps(obj)).toEqual(['a', 'b', 'c', 'd.a', 'd.b.0', 'd.b.1', 'd.b.2']);
  });

  it('should deep equal', () => {
    let obj1 = { a: 1, b: 2, c: 3 };
    let obj2 = { a: 1, b: 2, c: 3 };
    let obj3 = { a: 1, b: 2, c: 4 };

    expect(deepEqual(obj1, obj2)).toEqual(true);
    expect(deepEqual(obj1, obj3)).toEqual(false);
  });

  it('should deep clone', () => {
    let date = new Date();
    let obj1 = { a: 1, b: 2, c: 3, d: BigInt(12121212), e: date };
    let obj2 = { a: 1, b: 2, c: 3, d: BigInt(12121212), e: date };
    let obj3 = { a: 1, b: 2, c: 4, d: BigInt(12121213), e: date };
    let obj4 = { a: 1, b: 2, c: 4, d: BigInt(12121212), e: new Date() };

    expect(deepEqual(deepClone(obj1), obj2)).toEqual(true);
    expect(deepEqual(deepClone(obj1), obj3)).toEqual(false);
    expect(deepEqual(deepClone(obj1), obj4)).toEqual(false);
  });

  it('should deep clone json', () => {
    let obj1 = { a: 1, b: 2, c: 3 };
    let obj2 = { a: 1, b: 2, c: 3 };
    let obj3 = { a: 1, b: 2, c: 4 };

    expect(deepEqual(deepCloneJSON(obj1), obj2)).toEqual(true);
    expect(deepEqual(deepCloneJSON(obj1), obj3)).toEqual(false);
  });

  it('intersection', () => {
    let obj1 = { a: 1, b: 2, c: 3 };
    let obj2 = { a: 4, b: 5, d: 7 };

    expect(intersection(obj1, obj2)).toEqual({ a: 1, b: 2 });
  });

});
