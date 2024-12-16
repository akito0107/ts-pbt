type TransactionType = 'deposit' | 'withdraw' | 'cancel';

class Transaction {
    readonly id: string;
    readonly amount: number;

    constructor(id: string, amount: number) {
        this.id = id;
        this.amount = amount;
    }
}

const t = new Transaction('1', 100);

class Bank {
    private balance = 0;

    deposit(amount: number) {
        this.balance += amount;
    }

    withdraw(amount: number) {
        this.balance -= amount;
    }

    getBalance() {
        return this.balance;
    }
}