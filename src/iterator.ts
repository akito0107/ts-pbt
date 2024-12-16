const DATA = Array.from({length: 100}, () => Math.floor(Math.random() * 100));

/**
 * demo用のデータソース
 * DBや大量のデータをフェッチしてくるWeb APIなどが想定
 * データの総量は100件を想定しているが（パラメータで変更可能）一気には取得してこずに、batchSize件ずつ取得してくる。
 * データを全て取得し切ったかどうかを確認するためには、cursor = nullになっているかをチェックする。
 */
export class SimpleDataSource {
    // cursorはバッチとのバッチの中でのデータの位置を示すtuple
    // [currentBatch, batchIndex]
    private _cursor: [number, number] | null;

    // 本来のデータソース
    private readonly _data: number[] = []

    // データソースは一気にfetchせずに、batchSizeずつfetchしてくる仕様を想定する。
    // そのemulateのためにbatchSizeごとの件数のデータをbatchとして扱う
    private batches: Array<Array<number>> = [];
    private readonly batchSize: number;

    private batchLoaded = true;

    constructor({data, batchSize}: { data: number[], batchSize: number } = {
        data: DATA,
        batchSize: 2,
    }) {
        this._data = data;
        this._cursor = [0, 0];
        this.batchSize = batchSize;

        // 本来はcursorの指定でbatchを取得してくるが、簡単にするために
        // コンストラクタであらかじめbatchを作成してしまう。
        for (let i = 0; i < this._data.length; i += this.batchSize) {
            this.batches.push(this._data.slice(i, i + this.batchSize));
        }
        // dataは本来はさわれない想定なので、以降の処理は全てbatchを使って行う
    }

    // test用
    get data() {
        return this._data;
    }

    private get currentBatch() {
        return this._cursor![0]
    }

    private set currentBatch(batch: number) {
        this._cursor![0] = batch;
    }

    private get index() {
        return this._cursor![1];
    }

    private set index(index: number) {
        this._cursor![1] = index;
    }

    get cursor(): [number, number] | null {
        return this._cursor;
    }

    async load(cursor: [number, number]) {
        if (this.batches.length - 1 < cursor[0]) {
            throw new Error('invalid cursor');
        }
        if (this.batches[cursor[0]].length - 1 < cursor[1]) {
            throw new Error('invalid cursor');
        }

        // ここでデータをロードする想定
        this.batchLoaded = true

        this._cursor = cursor;
    }

    nextIndex() {
        if (this.index === this.batches[this.currentBatch].length - 1) {
            if (this.currentBatch === this.batches.length - 1) {
                this.batchLoaded = false;
                // 最後のbatchの最後のindex
                this._cursor = null;
            } else {
                // cursor自体は次のbatchを指すが、データはまだロードされていない想定
                // cursorを指定してloadしてもらうようにする
                this.batchLoaded = false;
                this.currentBatch = this.currentBatch + 1;
                this.index = 0;
            }
        } else {
            this.index = this.index + 1;
        }

        return this.cursor;
    }

    // batchごとのデータを取得する
    async next(): Promise<number> {
        const result = this.batches[this.currentBatch][this.index];
        this.nextIndex()
        return result
    }

    // そのbatch内にデータがあるかどうかを返す
    async hasNext() {
        return this.batchLoaded
    }

    invariant(): boolean {
        if (this.cursor != null) {
            // cursorがnullでなければ常に有効な範囲を指している
            return (this.currentBatch < this.batches.length)
                &&
                (this.index < this.batches[this.currentBatch].length)
        } else {
            return true
        }
    }
}

const READY = 'ready';
const NOT_READY = 'not_ready';
const DONE = 'done';
const FAILED = 'failed';

type State = typeof READY | typeof NOT_READY | typeof DONE | typeof FAILED;


/*
class AsyncDataCursor {
    private cursor: string | null = null;
    private state: State = NOT_READY;
    private nextValue: T | null = null;

    constructor() {
    }

    async computeNext(): Promise<T> {
        this.state = DONE;
        return this.data[0];
    }

    async tryComputeNext(): Promise<boolean> {
        this.state = FAILED as State;
        this.nextValue = await this.computeNext();

        if (this.state === DONE) {
            return false;
        }
        this.state = READY;
        return true;
    }

    async next(): Promise<T> {
        if (!this.hasNext()) {
            throw new Error('no more elements');
        }
        this.state = NOT_READY;
        const result = this.nextValue!;
        this.nextValue = null;
        return result;
    }

    async hasNext(): Promise<boolean> {
        switch (this.state) {
            case READY:
                return true;
            case DONE:
                return false;
            case FAILED:
                throw new Error('cursor is already failed');
            case NOT_READY:
                return this.tryComputeNext();
        }
    }

    getAfterCursor(): string | null {
        return this.cursor;
    }

    private endOfData() {
        this.state = DONE;
    }
}
 */