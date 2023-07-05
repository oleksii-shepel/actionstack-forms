import { boxed, deepClone, deepEqual, deepFreeze, difference, findProps, getValue, intersection, iterable, prop, setValue } from '../lib/ng-forms/utils';
describe('utils', () => {
  it('should get value', () => {
    const obj1 = { a: { b: { c: 1 } } };
    const obj2 = { a: { b: [{c: 1}] } };
    const obj3 = { a: [{ b: { c: 1 } }] };
    const obj4 = [ { b: { c: 1 } } ];
    const obj5 = {a: Object(BigInt(1))};
    const map = new Map([[Object(1), 'value1'], ['key2', 'value2']]), set = new Set([{a: 1}, {b: 2}, 3, 3]), array: any[] = [], array2 = [1, 2, 3];
    const obj6 = { s: map, t: set, o: array, p: array2 };

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
    const obj1 = { a: { b: { c: 1 } } };
    const obj2 = { a: { b: [{c: 1}] } };
    const obj3 = { a: [{ b: { c: 1 } }] };
    const obj4 = [ { b: { c: 1 } } ];

    expect(getValue(setValue(obj1, 'a.b.c', 2), 'a.b.c')).toEqual(2);
    expect(getValue(setValue(obj2, 'a.b.0.c', 2), 'a.b.0.c')).toEqual(2);
    expect(getValue(setValue(obj3, 'a.0.b.c', 2), 'a.0.b.c')).toEqual(2);
    expect(getValue(setValue(obj4, '0.b.c', 2), '0.b.c')).toEqual(2);
  });

  it('should iterate', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    expect([...iterable(obj)]).toEqual([1, 2, 3]);
    expect([...iterable(arr)]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('should get prop', () => {
    type Obj = { a: number; b: number; c: number; d: {a : number; b: number[]} }
    const obj: Obj = { a: 1, b: 2, c: 3, d: { a : 1, b: [1, 2, 3]} };

    expect(prop<Obj>(x => x.a)).toEqual('a');
    expect(prop<Obj>(x => x.b)).toEqual('b');
    expect(prop<Obj>(x => x.c)).toEqual('c');
    expect(prop<Obj>(x => x.d.a)).toEqual('d.a');
    expect(prop<Obj>(x => x.d.b[0])).toEqual('d.b.0');
  });

  it('should find props', () => {
    const obj = { a: 1, b: 2, c: 3, d: { a : 1, b: [1, 2, 3]}, e: BigInt(1), f: false, g: true, h: null, i: undefined, j: NaN, k: Infinity, l: -Infinity, m: '', n: 'a', q: {}, r: {a: 1}}
    const obj2 = { s: new Map([['key1', 'value1'], ['key2', 'value2']]), t: new Set([1, 2, 3, 3]), o: [], p: [1, 2, 3] };
    const obj3 = null;
    const obj4 = undefined;
    const obj5 = 'string';
    const obj6 = [1, {a: 1}, {a: {b: 1}}];

    expect(findProps(obj)).toEqual(['a', 'b', 'c', 'd.a', 'd.b', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'q', 'r.a']);
    expect(findProps(obj2)).toEqual(['s', 't', 'o', 'p']);
    expect(findProps(obj3)).toEqual([]);
    expect(findProps(obj4)).toEqual([]);
    expect(findProps(obj5)).toEqual([]);
    expect(findProps(obj6)).toEqual(["0", "1.a", "2.a.b"]);
  });

  it('should deep equal', () => {
    const obj1 = { a: 1, b: 2, c: 3 };
    const obj2 = { a: 1, b: 2, c: 3 };
    const obj3 = { a: 1, b: 2, c: 4 };

    expect(deepEqual(obj1, obj2)).toEqual(true);
    expect(deepEqual(obj1, obj3)).toEqual(false);
  });

  it('should deep clone', () => {
    const date = new Date();
    const obj1 = { a: 1, b: 2, c: 3, d: BigInt(12121212), e: date };
    const obj2 = { a: 1, b: 2, c: 3, d: BigInt(12121212), e: date };
    const obj3 = { a: 1, b: 2, c: 4, d: BigInt(12121213), e: date };
    const obj4 = { a: 1, b: 2, c: 4, d: BigInt(12121212), e: new Date() };
    const obj5 = { a: 1, b: 2, c: 4, d: Object(BigInt(12121212)), e: new Date() };
    const obj6 = { a: new Map([['key1', 'value1'], ['key2', 'value2']]) };
    const ref6 = { a: new Map([['key1', 'value1'], ['key2', 'value3'], ]) };
    const obj7 = { a: new Set([1, 2, 3, 4]) };
    const ref7 = { a: new Set([1, 2, 3, 5]) };

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

  it('should deep freeze object', () => {

  });

  it('boxed', () => {
    const obj1 = { a: 1, b: 2, c: 3 };
    const obj2 = false;
    const obj3 = BigInt(1);
    const obj4 = Object(1n);
    const obj5 = null;
    const obj6 = undefined;
    const obj7 = new Date();
    const obj8 = new RegExp('a');
    const obj9 = new String('a');
    const obj10 = true;
    const obj11 = 1;

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
    const obj1 = { a: 1, b: 2, c: 3, e: [1, 2]};
    const obj2 = { a: 4, b: 5, d: 7, e: [1] };

    expect(intersection(obj1, obj2)).toEqual({ a: 1, b: 2, e: [1, 2] });
  });

  it('should return the difference', () => {
    const obj1 = { a: 4, b: 5, d: 7, e: [1] };
    const obj2 = { a: 1, b: 2, c: 3, e: [1, 2]};
    const obj3 = { a: 1, b: 2, c: 3, e: [2, 2]};

    expect(difference(obj1, obj2)).toEqual({"added": {"c": 3}, "changed": {"a": 1, "b": 2, "e": [1, 2]}, "removed": {"d": 7}} );
    expect(difference(obj2, obj3)).toEqual({"changed": {"e": [2, 2]}});
  });

  it('should deep freeze an object', () => {

    const obj1 = { a: 1, b: 2, c: 3, e: [1, 2]};
    const obj2 = { a: 4, b: 5, d: 7, e: [1] };

    const freezed1 = deepFreeze(obj1);
    const freezed2 = deepFreeze(obj2);

    expect(() => freezed1.a = 2).toThrow(TypeError);
    expect(() => freezed1.e[0] = 2).toThrow(TypeError);
    expect(() => freezed2.a = 2).toThrow(TypeError);
    expect(() => freezed2.e[0] = 2).toThrow(TypeError);
  });
});
