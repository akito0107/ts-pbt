import { test, type TestContext } from 'node:test';

import fc from 'fast-check';


// const add = (a: number, b: number) => 0;
const add = (a: number, b: number) => a + b;

test('add zero', (t: TestContext) => {
    fc.assert(fc.property(fc.integer(), (x) => {
        return add(x, 0) === x;
    }))
});

// test('1 + 2 = 3', (t: TestContext) => {
//     const actual = add(1, 2);
// 
//     t.assert.deepStrictEqual(actual, 3);
// });


test('add (property-based)', (t: TestContext) => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
        return add(a, b) === add(b, a);
    }));
});

test('add assoc', (t: TestContext) => {
    fc.assert(fc.property(fc.integer(), fc.integer(), fc.integer(), (x, y, z) => {
        // (x + y) + z === x + (y + z)
        return add(z, add(x, y)) === add(x, add(y, z));
    }));
});
