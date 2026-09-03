<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from './lib/api';
  import { Pie, Bar } from 'svelte-chartjs';
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement
  } from 'chart.js';
  import { Trash2, TrendingUp, TrendingDown, DollarSign, Plus } from 'lucide-svelte';

  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);
  ChartJS.defaults.color = '#cbd5e1';

  let transactions = $state<any[]>([]);
  let analytics = $state<any>(null);

  let amount = $state('');
  let type = $state<'INCOME' | 'EXPENSE'>('EXPENSE');
  let category = $state('Food');
  let note = $state('');
  let date = $state(new Date().toISOString().split('T')[0]);
  let isSubmitting = $state(false);

  const EXPENSE_CATEGORIES = ['Food', 'Housing', 'Transportation', 'Utilities', 'Entertainment', 'Shopping', 'Other'];
  const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'];

  async function loadData() {
    const [txRes, anRes] = await Promise.all([
      api.api.transactions.get(),
      api.api.analytics.get()
    ]);
    if (txRes.data) transactions = txRes.data;
    if (anRes.data) analytics = anRes.data;
  }

  onMount(() => {
    loadData();
  });

  async function addTransaction(e: Event) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    isSubmitting = true;
    try {
      await api.api.transactions.post({
        amount: Math.round(Number(amount) * 100),
        type,
        category,
        date,
        note
      });
      amount = '';
      note = '';
      await loadData();
    } finally {
      isSubmitting = false;
    }
  }

  async function deleteTransaction(id: string) {
    await api.api.transactions({id}).delete();
    await loadData();
  }

  let pieData = $derived(() => {
    if (!analytics?.expensesByCategory?.length) return null;
    return {
      labels: analytics.expensesByCategory.map((e: any) => e.category),
      datasets: [
        {
          data: analytics.expensesByCategory.map((e: any) => e.total / 100),
          backgroundColor: [
            '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'
          ],
          borderWidth: 0,
        }
      ]
    };
  });

  let barData = $derived(() => {
    if (!analytics?.monthly?.length) return null;
    return {
      labels: analytics.monthly.map((m: any) => m.month),
      datasets: [
        {
          label: 'Income',
          data: analytics.monthly.map((m: any) => m.income / 100),
          backgroundColor: '#10b981',
          borderRadius: 4,
        },
        {
          label: 'Expense',
          data: analytics.monthly.map((m: any) => m.expense / 100),
          backgroundColor: '#f43f5e',
          borderRadius: 4,
        }
      ]
    };
  });

  function formatCurrency(cents: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  }
</script>

<main class="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-teal-500/30">
  <div class="max-w-7xl mx-auto space-y-8">
    
    <!-- Header -->
    <header class="flex items-center justify-between">
      <h1 class="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 flex items-center gap-3">
        <div class="p-2 bg-slate-900 rounded-xl shadow-lg border border-slate-800">
          <DollarSign class="text-teal-400 w-8 h-8" />
        </div>
        FinDash
      </h1>
    </header>

    <!-- Top Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-slate-900/50 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl shadow-xl flex items-center gap-4 transition-transform hover:scale-[1.02]">
        <div class="p-4 bg-emerald-500/10 rounded-full text-emerald-400">
          <TrendingUp class="w-8 h-8" />
        </div>
        <div>
          <p class="text-sm text-slate-400 font-medium">Total Income</p>
          <p class="text-2xl font-bold text-white">{analytics ? formatCurrency(analytics.summary.totalIncome) : '$0.00'}</p>
        </div>
      </div>
      <div class="bg-slate-900/50 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl shadow-xl flex items-center gap-4 transition-transform hover:scale-[1.02]">
        <div class="p-4 bg-rose-500/10 rounded-full text-rose-400">
          <TrendingDown class="w-8 h-8" />
        </div>
        <div>
          <p class="text-sm text-slate-400 font-medium">Total Expenses</p>
          <p class="text-2xl font-bold text-white">{analytics ? formatCurrency(analytics.summary.totalExpense) : '$0.00'}</p>
        </div>
      </div>
      <div class="bg-slate-900/50 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl shadow-xl flex items-center gap-4 transition-transform hover:scale-[1.02]">
        <div class="p-4 bg-blue-500/10 rounded-full text-blue-400">
          <DollarSign class="w-8 h-8" />
        </div>
        <div>
          <p class="text-sm text-slate-400 font-medium">Net Balance</p>
          <p class="text-2xl font-bold text-white">{analytics ? formatCurrency(analytics.summary.totalIncome - analytics.summary.totalExpense) : '$0.00'}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Add Transaction & Charts -->
      <div class="lg:col-span-1 space-y-8">
        
        <!-- Add Transaction Form -->
        <section class="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
            <Plus class="w-5 h-5 text-teal-400" /> New Transaction
          </h2>
          
          <form onsubmit={addTransaction} class="space-y-4">
            <div class="flex gap-4 p-1 bg-slate-950 rounded-xl border border-slate-800/50">
              <button 
                type="button" 
                onclick={() => { type = 'EXPENSE'; category = 'Food'; }}
                class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type === 'EXPENSE' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-slate-300'}"
              >
                Expense
              </button>
              <button 
                type="button" 
                onclick={() => { type = 'INCOME'; category = 'Salary'; }}
                class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-300'}"
              >
                Income
              </button>
            </div>

            <div class="space-y-4 mt-6">
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Amount ($)</label>
                <input 
                  type="number" step="0.01" min="0" required 
                  bind:value={amount}
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                  placeholder="0.00"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-400 mb-1">Date</label>
                  <input 
                    type="date" required 
                    bind:value={date}
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <select 
                    bind:value={category}
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {#each type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES as cat}
                      <option value={cat}>{cat}</option>
                    {/each}
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Note (Optional)</label>
                <input 
                  type="text" 
                  bind:value={note}
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="E.g., Groceries"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              class="w-full mt-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-teal-500/25 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </button>
          </form>
        </section>

        <!-- Pie Chart -->
        <section class="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h2 class="text-xl font-semibold mb-6">Expenses by Category</h2>
          {#if pieData()}
            <div class="h-64 flex justify-center">
              <Pie 
                data={pieData()!} 
                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#cbd5e1' } } } }} 
              />
            </div>
          {:else}
            <div class="h-64 flex items-center justify-center text-slate-500 italic">No expenses yet</div>
          {/if}
        </section>

      </div>

      <!-- Right Column: Bar Chart & Ledger -->
      <div class="lg:col-span-2 space-y-8">
        
        <!-- Bar Chart -->
        <section class="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h2 class="text-xl font-semibold mb-6">Cash Flow (Monthly)</h2>
          {#if barData()}
            <div class="h-64">
              <Bar 
                data={barData()!} 
                options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: '#334155' } }, x: { grid: { display: false } } } }} 
              />
            </div>
          {:else}
            <div class="h-64 flex items-center justify-center text-slate-500 italic">No data yet</div>
          {/if}
        </section>

        <!-- Ledger -->
        <section class="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h2 class="text-xl font-semibold mb-6">Recent Transactions</h2>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400 text-sm">
                  <th class="pb-3 font-medium">Date</th>
                  <th class="pb-3 font-medium">Category & Note</th>
                  <th class="pb-3 font-medium text-right">Amount</th>
                  <th class="pb-3 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                {#each transactions as tx (tx.id)}
                  <tr class="group hover:bg-slate-800/30 transition-colors">
                    <td class="py-4 text-sm text-slate-300">{tx.date}</td>
                    <td class="py-4">
                      <div class="flex flex-col">
                        <span class="font-medium text-slate-200">{tx.category}</span>
                        {#if tx.note}
                          <span class="text-xs text-slate-500">{tx.note}</span>
                        {/if}
                      </div>
                    </td>
                    <td class="py-4 text-right font-medium {tx.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'}">
                      {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td class="py-4 text-center">
                      <button 
                        onclick={() => deleteTransaction(tx.id)}
                        class="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                {:else}
                  <tr>
                    <td colspan="4" class="py-8 text-center text-slate-500 italic">
                      No transactions recorded.
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  </div>
</main>
