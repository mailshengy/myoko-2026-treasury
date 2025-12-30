import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { fetchData, AppData } from '@/lib/api';
import { Loader2, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Expenses() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen text-[#8FA89B]">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
        </div>
      </Layout>
    );
  }

  if (!data) return null;

  const filteredExpenses = filter === 'All' 
    ? data.expenses 
    : data.expenses.filter(e => e.paidBy === filter);

  const uniquePayers = Array.from(new Set(data.expenses.map(e => e.paidBy)));

  return (
    <Layout>
      <div className="pt-12 px-6 pb-8 min-h-screen">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="font-serif text-3xl text-[#2C3E50] mb-2">Expenses</h1>
            <p className="text-[#2C3E50]/60 text-sm">
              {data.expenses.length} transactions recorded
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
          <button
            onClick={() => setFilter('All')}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
              filter === 'All' 
                ? "bg-[#2C3E50] text-white" 
                : "bg-white text-[#2C3E50] border border-[#2C3E50]/10"
            )}
          >
            All
          </button>
          {uniquePayers.map(payer => (
            <button
              key={payer}
              onClick={() => setFilter(payer)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                filter === payer 
                  ? "bg-[#2C3E50] text-white" 
                  : "bg-white text-[#2C3E50] border border-[#2C3E50]/10"
              )}
            >
              {payer}
            </button>
          ))}
        </div>

        {/* Expense List */}
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="bg-white rounded-xl p-4 shadow-sm border border-[#2C3E50]/5 flex justify-between items-center group hover:border-[#8FA89B]/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-[#F5F5F0] rounded-lg text-[#2C3E50]/70">
                  <span className="text-[10px] font-bold uppercase">{new Date(expense.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-lg font-serif leading-none">{new Date(expense.date).getDate()}</span>
                </div>
                <div>
                  <p className="font-medium text-[#2C3E50]">{expense.description}</p>
                  <p className="text-xs text-[#2C3E50]/50 mt-0.5">
                    Paid by <span className="font-semibold text-[#2C3E50]/70">{expense.paidBy}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm text-[#2C3E50] block">
                  {expense.currency === 'JPY' ? '¥' : 'S$'}{expense.amount.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#2C3E50]/40 uppercase tracking-wider">
                  {expense.splitMethod}
                </span>
              </div>
            </div>
          ))}

          {filteredExpenses.length === 0 && (
            <div className="text-center py-12 text-[#2C3E50]/40">
              <p>No expenses found.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
