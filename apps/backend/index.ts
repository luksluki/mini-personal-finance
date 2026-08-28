import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { db, type Transaction } from "./db";
import { randomUUID } from "crypto";

const app = new Elysia()
  .use(cors())
  .get("/api/transactions", () => {
    const query = db.query("SELECT * FROM transactions ORDER BY date DESC");
    return query.all() as Transaction[];
  })
  .post("/api/transactions", ({ body }) => {
    const id = randomUUID();
    const query = db.query(`
      INSERT INTO transactions (id, amount, type, category, date, note)
      VALUES ($id, $amount, $type, $category, $date, $note)
      RETURNING *
    `);
    const newTransaction = query.get({
      $id: id,
      $amount: body.amount,
      $type: body.type,
      $category: body.category,
      $date: body.date,
      $note: body.note || null
    });
    return newTransaction as Transaction;
  }, {
    body: t.Object({
      amount: t.Integer(),
      type: t.Union([t.Literal("INCOME"), t.Literal("EXPENSE")]),
      category: t.String(),
      date: t.String(),
      note: t.Optional(t.String())
    })
  })
  .delete("/api/transactions/:id", ({ params: { id } }) => {
    const query = db.query("DELETE FROM transactions WHERE id = $id RETURNING *");
    const deleted = query.get({ $id: id });
    if (!deleted) {
      return new Response("Not found", { status: 404 });
    }
    return deleted as Transaction;
  })
  .get("/api/analytics", () => {
    const query = db.query(`
      SELECT type, category, SUM(amount) as total
      FROM transactions
      GROUP BY type, category
    `);
    const results = query.all() as { type: string; category: string; total: number }[];
    
    // Process results into a format suitable for the dashboard
    const summary = results.reduce((acc, row) => {
      if (row.type === "INCOME") acc.totalIncome += row.total;
      else if (row.type === "EXPENSE") acc.totalExpense += row.total;
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    const expensesByCategory = results
      .filter(r => r.type === "EXPENSE")
      .map(r => ({ category: r.category, total: r.total }));

    // Also get monthly summary
    const monthlyQuery = db.query(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense
      FROM transactions
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month ASC
    `);
    const monthly = monthlyQuery.all();

    return {
      summary,
      expensesByCategory,
      monthly
    };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;