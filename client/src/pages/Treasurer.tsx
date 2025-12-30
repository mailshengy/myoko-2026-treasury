import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { fetchData, addExpense, AppData } from '@/lib/api';
import { Loader2, Lock, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Treasurer() {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'JPY' | 'SGD'>('JPY');
  const [paidBy, setPaidBy] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Check if already authenticated in session
    const sessionAuth = sessionStorage.getItem('treasurer_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = () => {
    setLoading(true);
    fetchData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, verify with server. Here we check env var or simple string
    // For demo purposes, let's accept '2026' or the env var
    const correct = import.meta.env.VITE_TREASURER_PASSCODE || '2026';
    
    if (passcode === correct) {
      setIsAuthenticated(true);
      sessionStorage.setItem('treasurer_auth', 'true');
      loadData();
      toast.success('Welcome, Treasurer');
    } else {
      toast.error('Incorrect passcode');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !paidBy) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const success = await addExpense({
        date,
        description,
        amount: Number(amount),
        currency,
        paidBy,
        splitMethod: 'Equal'
      }, passcode);

      if (success) {
        toast.success('Expense added successfully');
        // Reset form
        setDescription('');
        setAmount('');
        // Keep payer and currency as they might be repetitive
        loadData(); // Refresh data
      } else {
        toast.error('Failed to add expense');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <div className="w-16 h-16 bg-[#2C3E50] rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-[#2C3E50]/20">
            <Lock size={32} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-2xl text-[#2C3E50] mb-2">Treasurer Access</h1>
          <p className="text-[#2C3E50]/60 text-sm mb-8 text-center">
            Enter the group passcode to add expenses.
          </p>

          <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Passcode"
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#2C3E50]/10 focus:border-[#2C3E50] focus:ring-0 outline-none text-center text-lg tracking-widest transition-all"
              autoFocus
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#2C3E50] text-white rounded-xl font-medium hover:bg-[#2C3E50]/90 transition-colors shadow-lg shadow-[#2C3E50]/20"
            >
              Unlock
            </button>
          </form>
        </div>
      </Layout>
    );
  }

  if (loading || !data) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen text-[#8FA89B]">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
        </div>
      </Layout>
    );
  }

  const uniquePayers = data.participants.map(p => p.name);

  return (
    <Layout>
      <div className="pt-12 px-6 pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl text-[#2C3E50]">Add Expense</h1>
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              sessionStorage.removeItem('treasurer_auth');
            }}
            className="text-xs text-[#C7826B] font-medium uppercase tracking-wider"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount & Currency */}
          <div className="bg-white p-2 rounded-2xl border border-[#2C3E50]/10 flex shadow-sm">
            <div className="flex-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full h-full px-4 text-3xl font-mono font-medium bg-transparent outline-none placeholder:text-[#2C3E50]/20"
                required
              />
            </div>
            <div className="flex bg-[#F5F5F0] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setCurrency('JPY')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  currency === 'JPY' ? "bg-white shadow-sm text-[#2C3E50]" : "text-[#2C3E50]/40"
                )}
              >
                JPY
              </button>
              <button
                type="button"
                onClick={() => setCurrency('SGD')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  currency === 'SGD' ? "bg-white shadow-sm text-[#2C3E50]" : "text-[#2C3E50]/40"
                )}
              >
                SGD
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#2C3E50]/40 mb-2 ml-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner at Izakaya"
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#2C3E50]/10 focus:border-[#8FA89B] outline-none transition-all"
              required
            />
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#2C3E50]/40 mb-2 ml-1">Paid By</label>
            <div className="grid grid-cols-2 gap-2">
              {uniquePayers.map((payer) => (
                <button
                  key={payer}
                  type="button"
                  onClick={() => setPaidBy(payer)}
                  className={cn(
                    "py-3 px-4 rounded-xl text-sm font-medium transition-all border text-left flex justify-between items-center",
                    paidBy === payer
                      ? "bg-[#2C3E50] text-white border-[#2C3E50] shadow-md shadow-[#2C3E50]/20"
                      : "bg-white text-[#2C3E50] border-[#2C3E50]/10 hover:border-[#2C3E50]/30"
                  )}
                >
                  {payer}
                  {paidBy === payer && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#2C3E50]/40 mb-2 ml-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#2C3E50]/10 focus:border-[#8FA89B] outline-none transition-all"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#C7826B] text-white rounded-2xl font-medium text-lg shadow-lg shadow-[#C7826B]/30 hover:bg-[#C7826B]/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Plus size={20} strokeWidth={2.5} />
                Add Expense
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}
