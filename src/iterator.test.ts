import { test, type TestContext } from 'node:test';

import fc from 'fast-check';

test('1 + 2 = 3', (t: TestContext) => {
    t.assert.deepStrictEqual(1 + 2, 3);
});

test('1 + 2 = 3 (property-based)', (t: TestContext) => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
        return a + b === b + a;
    }));
});