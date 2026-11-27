// Ledger

export interface Categories {
    id: number;
    name: string;
    archived: boolean;
    is_system: boolean;
    color: string;
}

export interface Accounts {
    id: number;
    name: string;
    archived: boolean;
    is_system: boolean;
    color: string;
}

export interface Contacts {
    id: number;
    name: string;
    archived: boolean;
    color: string;
}

export interface FundTypes {
    id: number;
    name: string;
    archived: boolean;
    color: string;
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

export interface Investments {
    id: number;
    fund_type_id: number;
    name: string;
    unit: string;
    current_bid: number;
    last_updated: string;
    archived: boolean;
}

export interface Investments {
    id: number;
    fund_type_id: number;
    name: string;
    unit: string;
    current_bid: number;
    last_updated: string;
    archived: boolean;
}

export interface Investment_Lots {
    id: number;
    investment_id: number;
    buy_transaction_id: number;
    initial_quantity: number;
    remaining_quantity: number;
    unit_cost: number; // Ask price of a single unit at time of purchase
    holding: boolean;
    purchased_at: string;
}

export interface Investment_Sales {
    id: number;
    lot_id: number;
    proceeds_transaction_id: number;
    basis_transaction_id: number;
    quantity_sold: number;
    unit_price: number;
    sold_at: string;
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

export interface AccountBalance extends Accounts {
    balance: number;
}

export interface AccountEntry {
    accountId: number;
    value: string;
}

export interface TransactionsAtDay {
    dayLabel: string;
    transactions: TransactionByTime[];
    endOfDayBalances: Record<number, number>;
    endOfDayEquity: number;
}

export interface Claim {
    id: number;
    transaction_id: number;
    contact_id: number;
    name: string;
    date: string;
    description: string;
    value: number;
}
