import {test, type TestContext} from 'node:test';

import fc from 'fast-check';

function sort(l: Array<number>): Array<number> {
    return l.sort((a, b) => a - b);
}

function sorted(l: Array<number>): boolean {
    if (l.length === 0) {
        return true
    } else {
        const [x, ...ys] = l;
        return ys.every(y => x <= y) && sorted(ys);
    }
}

test('sort spec', (t: TestContext) => {
    fc.assert(
        fc.property(fc.array(fc.integer()), (l) => {
            const lp = sort(l); // TSでは'が使えないので、lpとする

            return sorted(lp)
                && l.length === lp.length
                && l.every((x) => lp.includes(x));
        }))
});
