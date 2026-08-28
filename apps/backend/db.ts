import { Database } from "bun:sqlite";

export const db = new Database(process.env.DB_PATH || "./finance.db", { create: true });

db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('INCOME', 'EXPENSE')),
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    note TEXT
  );
`);

export interface Transaction {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
  note: string | null;
}
