import { test, type TestContext } from 'node:test';
import { SimpleDataSource } from "./iterator.ts";
import assert from 'node:assert';
import fc from 'fast-check';

test('SimpleDataSource: fetch all data', async (t: TestContext) => {

    await fc.assert(
        fc.asyncProperty(fc.array(fc.integer()), fc.integer(), async (src, size) => {

            // 入力に関する事前条件を設定できる
            fc.pre(size > 0 && src.length >= size);

            let dataSource = new SimpleDataSource({ data: src, batchSize: size });
            let arr: number[] = []
            let cursor;
            while (await dataSource.hasNext()) {
                assert(dataSource.invariant()); // 不変条件のチェック
                arr = [...arr, await dataSource.next()];

                if (!(await dataSource.hasNext())) {
                    cursor = dataSource.cursor;
                    if (cursor != null) {
                        await dataSource.load(cursor);
                    }
                }
            }

            assert.deepStrictEqual(arr, src);
        }))
});

test('SimpleDataSource: fetch all data with cursor', async (t: TestContext) => {

    // cursorを使っても全てのデータをfetchできるかを確認する
    await fc.assert(
        fc.asyncProperty(fc.array(fc.integer()), fc.integer(), async (src, size) => {

            // 入力に関する事前条件を設定できる
            fc.pre(size > 0 && src.length >= size);

            let dataSource = new SimpleDataSource({ data: src, batchSize: size });
            let arr: number[] = []
            let cursor;
            while (await dataSource.hasNext()) {
                assert(dataSource.invariant()); // 不変条件のチェック
                arr = [...arr, await dataSource.next()];

                cursor = dataSource.cursor;
                if (cursor != null) {
                    await dataSource.load(cursor);
                }
            }

            assert.deepStrictEqual(arr, src);
        }))
});

test('SimpleDataSource: fetch all data (no PBT)', async (t: TestContext) => {
    const data = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100));

    let dataSource = new SimpleDataSource({ data, batchSize: 2 });
    let arr: number[] = []
    let cursor;
    while (await dataSource.hasNext()) {
        assert(dataSource.invariant());
        arr = [...arr, await dataSource.next()];

        if (!(await dataSource.hasNext())) {
            cursor = dataSource.cursor;
            if (cursor != null) {
                await dataSource.load(cursor)
            }
        }
    }

    assert.deepStrictEqual(arr, data);
});

/*
test('SimpleDataSource: fetch with cursor', async (t: TestContext) => {
    await fc.assert(
        fc.asyncProperty(fc.integer(), fc.integer(), async (length, size) => {

            fc.pre(length > 0 && size > 0 && length >= size);

            const dataSource = new SimpleDataSource(length, size);
            let arr: number[] = []

            while (!dataSource.lastBatch && await dataSource.hasNext()) {
                const cursor = dataSource.cursor;
                arr = [...arr, await dataSource.next(cursor)];

                if (!dataSource.lastBatch && !(await dataSource.hasNext())) {
                    await dataSource.loadNextBatch();
                }
            }

            assert.deepStrictEqual(arr, dataSource.data);
        }))
});
 */
/*


*/
