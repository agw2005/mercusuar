// Ledger

export interface Categories {
    id: number;
    name: string;
    archived: boolean;
    is_system: boolean;
}

export interface Accounts {
    id: number;
    name: string;
    archived: boolean;
    is_system: boolean;
}

export interface Contacts {
    id: number;
    name: string;
    archived: boolean;
}

export interface FundTypes {
    id: number;
    name: string;
    archived: boolean;
}

export interface Transactions {
    id: number;
    category_id: number;
    account_id: number;
    value: number;
    description: string;
    date: string;
}

export interface Receivables {
    id: number;
    transaction_id: number;
    contact_id: number;
}

export interface Debts {
    id: number;
    transaction_id: number;
    contact_id: number;
}

// Custom types

export interface AccountChange {
    accountId: number;
    value: number;
}

export interface TransactionByTime {
    category: number;
    changes: (AccountChange & { transactionId: number })[];
    description: string;
    date: string;
}
