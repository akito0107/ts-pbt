import {test, type TestContext} from 'node:test';
import fc from 'fast-check';
import assert from "node:assert";

type Nat =
    | { tag: 'zero' }
    | { tag: 'succ', pred: Nat }

const add_nat = (m: Nat, n: Nat): Nat => {
    switch (n.tag) {
        case 'zero':
            return m;
        case 'succ':
            const {pred: np, tag: _} = n;
            return {tag: 'succ', pred: add_nat(m, np)}
    }
}

const add = (a: number, b: number) =>
    nat_to_number(add_nat(number_to_nat(a), (number_to_nat(b))))

const nat_to_number = (n: Nat): number => {
    switch (n.tag) {
        case 'zero':
            return 0;
        case 'succ':
            const {pred: np, tag: _} = n;
            return 1 + nat_to_number(np)
    }
}

const number_to_nat = (n: number): Nat => {
    if (n === 0) {
        return {tag: 'zero'}
    } else {
        return {tag: 'succ', pred: number_to_nat(n - 1)}
    }
}

test('test oracle, same as +', (t: TestContext) => {
    fc.assert(fc.property(fc.integer({min: 0, max: 1000}), fc.integer({min: 0, max: 1000}), (x, y) => {
        return x + y === add(x, y)
    }))
});
