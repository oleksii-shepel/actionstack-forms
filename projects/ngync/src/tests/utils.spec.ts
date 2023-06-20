import { boxed, deepClone, deepCloneJSON, deepEqual, findProps, getValue, intersection, iterable, prop, setValue } from '../lib/shared/utils';
describe('utils', () => {
  it('should get value', () => {
    let obj1 = { a: { b: { c: 1 } } };
    let obj2 = { a: { b: [{c: 1}] } };
    let obj3 = { a: [{ b: { c: 1 } }] };
    let obj4 = [ { b: { c: 1 } } ];
    let obj5 = {a: Object(BigInt(1))};
    let map = new Map([[Object(1), 'value1'], ['key2', 'value2']]), set = new Set([{a: 1}, {b: 2}, 3, 3]), array: any[] = [], array2 = [1, 2, 3];
    let obj6 = { s: map, t: set, o: array, p: array2 };

    expect(getValue(obj1, 'a.b.c')).toEqual(1);
    expect(getValue(obj2, 'a.b.0.c')).toEqual(1);
    expect(getValue(obj3, 'a.0.b.c')).toEqual(1);
    expect(getValue(obj4, '0.b.c')).toEqual(1);
    expect(getValue(obj5, 'a').valueOf()).toEqual(1n);
    expect(getValue(obj6, 's')).toEqual(map);
    expect(getValue(obj6, 't')).toEqual(set);
    expect(getValue(obj6, 'o')).toEqual([]);
    expect(getValue(obj6, 'p.0')).toEqual(1);
    expect(getValue(obj6, 'p.1')).toEqual(2);
    expect(getValue(obj6, 'p.2')).toEqual(3);
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
    let obj = { a: 1, b: 2, c: 3, d: { a : 1, b: [1, 2, 3]}, e: BigInt(1), f: false, g: true, h: null, i: undefined, j: NaN, k: Infinity, l: -Infinity, m: '', n: 'a', q: {}, r: {a: 1}}
    let obj2 = { s: new Map([['key1', 'value1'], ['key2', 'value2']]), t: new Set([1, 2, 3, 3]), o: [], p: [1, 2, 3] };
    let obj3 = null;
    let obj4 = undefined;
    let obj5 = 'string';
    let obj6 = [1, {a: 1}, {a: {b: 1}}];

    expect(findProps(obj)).toEqual(['a', 'b', 'c', 'd.a', 'd.b.0', 'd.b.1', 'd.b.2', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'q', 'r.a']);
    expect(findProps(obj2)).toEqual(['s', 't', 'o', 'p.0', 'p.1', 'p.2']);
    expect(findProps(obj3)).toEqual([]);
    expect(findProps(obj4)).toEqual([]);
    expect(findProps(obj5)).toEqual([]);
    expect(findProps(obj6)).toEqual(['0', '1.a', '2.a.b']);
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
    let obj5 = { a: 1, b: 2, c: 4, d: Object(BigInt(12121212)), e: new Date() };
    let obj6 = { a: new Map([['key1', 'value1'], ['key2', 'value2']]) };
    let ref6 = { a: new Map([['key1', 'value1'], ['key2', 'value3'], ]) };
    let obj7 = { a: new Set([1, 2, 3, 4]) };
    let ref7 = { a: new Set([1, 2, 3, 5]) };

    expect(deepEqual(deepClone(obj1), obj1)).toEqual(true);
    expect(deepEqual(deepClone(obj2), obj2)).toEqual(true);
    expect(deepEqual(deepClone(obj3), obj3)).toEqual(true);
    expect(deepEqual(deepClone(obj4), obj4)).toEqual(true);
    expect(deepEqual(deepClone(obj5), obj5)).toEqual(true);
    expect(deepEqual(deepClone(obj6), obj6)).toEqual(true);
    expect(deepEqual(deepClone(obj7), obj7)).toEqual(true);
    expect(deepEqual(deepClone(obj6), ref6)).toEqual(false);
    expect(deepEqual(deepClone(obj7), ref7)).toEqual(false);
  });

  it('should deep clone json', () => {
    let obj1 = { a: 1, b: 2, c: 3 };
    let obj2 = { a: 1, b: 2, c: 3 };
    let obj3 = { a: 1, b: 2, c: 4 };

    expect(deepEqual(deepCloneJSON(obj1), obj2)).toEqual(true);
    expect(deepEqual(deepCloneJSON(obj1), obj3)).toEqual(false);
  });

  it('boxed', () => {
    let obj1 = { a: 1, b: 2, c: 3 };
    let obj2 = false;
    let obj3 = BigInt(1);
    let obj4 = Object(1n);
    let obj5 = null;
    let obj6 = undefined;
    let obj7 = new Date();
    let obj8 = new RegExp('a');
    let obj9 = new String('a');
    let obj10 = true;
    let obj11 = 1;

    expect(boxed(obj1)).toEqual(false);
    expect(boxed(obj2)).toEqual(false);
    expect(boxed(obj3)).toEqual(false);
    expect(boxed(obj4)).toEqual(true);
    expect(boxed(obj5)).toEqual(false);
    expect(boxed(obj6)).toEqual(false);
    expect(boxed(obj7)).toEqual(true);
    expect(boxed(obj8)).toEqual(false);
    expect(boxed(obj9)).toEqual(true);
    expect(boxed(obj10)).toEqual(false);
    expect(boxed(obj11)).toEqual(false);

  });

  it('intersection', () => {
    let obj1 = { a: 1, b: 2, c: 3 };
    let obj2 = { a: 4, b: 5, d: 7 };

    expect(intersection(obj1, obj2)).toEqual({ a: 1, b: 2 });
  });

});
