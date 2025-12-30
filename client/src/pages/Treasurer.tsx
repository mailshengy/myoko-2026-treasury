import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { fetchData, addExpense, addPayment, AppData } from '@/lib/api';
import { Loader2, Lock, Plus, Check, X } from 'lucide-react';
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
  const [category, setCategory] = useState('Food');
  const [notes, setNotes] = useState('');
  const [splitMethod, setSplitMethod] = useState<'Equal' | 'Custom'>('Equal');
  const [splitWith, setSplitWith] = useState<string[]>([]);

  // Payment Form State
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFrom, setPaymentFrom] = useState('');
  const [paymentTo, setPaymentTo] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState<'JPY' | 'SGD'>('SGD');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

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
    const correct = import.meta.env.VITE_TREASURER_PASSCODE || '2026';
    
    if (passcode === correct) {
      setIsAuthenticated(true);
      sessionStorage.setItem('treasurer_auth', 'true');
      loadData();
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

    if (splitMethod === 'Custom' && splitWith.length === 0) {
      toast.error('Please select at least one person for custom split');
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
        splitMethod,
        splitWith: splitMethod === 'Custom' ? splitWith : undefined,
        category,
        notes
      }, passcode);

      if (success) {
        toast.success('Expense added successfully');
        // Reset form
        setDescription('');
        setAmount('');
        setNotes('');
        setSplitMethod('Equal');
        setSplitWith([]);
        loadData();
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

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFrom || !paymentTo || !paymentAmount) {
      toast.error('Please fill in all payment fields');
      return;
    }

    setPaymentSubmitting(true);
    try {
      const success = await addPayment({
        date: paymentDate,
        from: paymentFrom,
        to: paymentTo,
        amount: Number(paymentAmount),
        currency: paymentCurrency,
        notes: paymentNotes
      }, passcode);

      if (success) {
        toast.success('Payment recorded successfully');
        setPaymentFrom('');
        setPaymentTo('');
        setPaymentAmount('');
        setPaymentNotes('');
        setShowPaymentForm(false);
        loadData();
      } else {
        toast.error('Failed to record payment');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="pt-12 px-6 pb-8 min-h-screen flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#2C3E50]/10 rounded-full flex items-center justify-center text-[#2C3E50] mb-6">
            <Lock size={32} />
          </div>
          <h1 className="font-serif text-2xl text-[#2C3E50] mb-2 text-center">Treasurer Mode</h1>
          <p className="text-[#2C3E50]/60 text-sm text-center mb-8 max-w-xs">
            Enter the passcode to access expense management
          </p>

          <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode"
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#2C3E50]/10 focus:border-[#8FA89B] outline-none transition-all text-center text-lg tracking-widest"
              autoFocus
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#2C3E50] text-white rounded-xl font-medium shadow-lg shadow-[#2C3E50]/20 hover:bg-[#2C3E50]/90 transition-all active:scale-[0.98]"
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

          {/* Split Method */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#2C3E50]/40 mb-2 ml-1">Split Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSplitMethod('Equal');
                  setSplitWith([]);
                }}
                className={cn(
                  "py-3 px-4 rounded-xl text-sm font-medium transition-all border",
                  splitMethod === 'Equal'
                    ? "bg-[#2C3E50] text-white border-[#2C3E50]"
                    : "bg-white text-[#2C3E50] border-[#2C3E50]/10 hover:border-[#2C3E50]/30"
                )}
              >
                Equal Split
              </button>
              <button
                type="button"
                onClick={() => setSplitMethod('Custom')}
                className={cn(
                  "py-3 px-4 rounded-xl text-sm font-medium transition-all border",
                  splitMethod === 'Custom'
                    ? "bg-[#2C3E50] text-white border-[#2C3E50]"
                    : "bg-white text-[#2C3E50] border-[#2C3E50]/10 hover:border-[#2C3E50]/30"
                )}
              >
                Custom Split
              </button>
            </div>
          </div>

          {/* Custom Split Selection */}
          {splitMethod === 'Custom' && (
            <div>
              <label className="block text-xs font-bold uppercase text-[#2C3E50]/40 mb-2 ml-1">
                Who shares this expense?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {uniquePayers.map((person) => (
                  <button
                    key={person}
                    type="button"
                    onClick={() => {
                      if (splitWith.includes(person)) {
                        setSplitWith(splitWith.filter(p => p !== person));
                      } else {
                        setSplitWith([...splitWith, person]);
                      }
                    }}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm font-medium transition-all border flex items-center justify-between",
                      splitWith.includes(person)
                        ? "bg-[#8FA89B] text-white border-[#8FA89B]"
                        : "bg-white text-[#2C3E50] border-[#2C3E50]/10 hover:border-[#2C3E50]/30"
                    )}
                  >
                    {person}
                    {splitWith.includes(person) && <Check size={14} />}
                  </button>
                ))}
              </div>
              {splitWith.length > 0 && (
                <p className="text-xs text-[#8FA89B] mt-2 ml-1">
                  {splitWith.length} person{splitWith.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#2C3E50]/40 mb-2 ml-1">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {['Food', 'Transport', 'Accommodation', 'Activities'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "py-2 px-3 rounded-lg text-sm font-medium transition-all border text-center",
                    category === cat
                      ? "bg-[#2C3E50] text-white border-[#2C3E50]"
                      : "bg-white text-[#2C3E50] border-[#2C3E50]/10 hover:border-[#2C3E50]/30"
                  )}
                >
                  {cat}
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

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#2C3E50]/40 mb-2 ml-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Shared with 3 people only"
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#2C3E50]/10 focus:border-[#8FA89B] outline-none transition-all resize-none h-20"
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

        {/* Payment Recording Section */}
        <div className="mt-12 pt-8 border-t border-[#2C3E50]/10">
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="text-[#C7826B] font-medium text-sm uppercase tracking-wider hover:text-[#C7826B]/80 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            Record Payment
          </button>

          {showPaymentForm && (
            <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4 bg-[#F5F5F0] p-6 rounded-2xl">
              <h3 className="font-serif text-lg text-[#2C3E50] mb-4">Record a Payment</h3>
              <div><label className="block text-xs font-bold uppercase text-[#2C3E50]/40 mb-2 ml-1">From</label><select value={paymentFrom} onChange={(e) => setPaymentFrom(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-[#2C3E50]/10 outline-none" required><option value="">Select</option>{data.participants.map(p => (<option key={p.name} value={p.name}>{p.name}</option>))}</select></div>
              <div><label className="block text-xs font-bold uppercase text-[#2C3E50]/40 mb-2 ml-1">To</label><select value={paymentTo} onChange={(e) => setPaymentTo(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-[#2C3E50]/10 outline-none" required><option value="">Select</option>{data.participants.map(p => (<option key={p.name} value={p.name}>{p.name}</option>))}</select></div>
              <div className="bg-white p-2 rounded-2xl border border-[#2C3E50]/10 flex"><input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0" className="flex-1 px-4 text-2xl font-mono bg-transparent outline-none" required /><div className="flex bg-[#F5F5F0] rounded-xl p-1"><button type="button" onClick={() => setPaymentCurrency('JPY')} className={cn("px-3 py-2 rounded-lg text-xs font-bold", paymentCurrency === 'JPY' ? "bg-white" : "text-[#2C3E50]/40")}>JPY</button><button type="button" onClick={() => setPaymentCurrency('SGD')} className={cn("px-3 py-2 rounded-lg text-xs font-bold", paymentCurrency === 'SGD' ? "bg-white" : "text-[#2C3E50]/40")}>SGD</button></div></div>
              <div><label className="block text-xs font-bold uppercase text-[#2C3E50]/40 mb-2 ml-1">Date</label><input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-[#2C3E50]/10 outline-none" required /></div>
              <div><label className="block text-xs font-bold uppercase text-[#2C3E50]/40 mb-2 ml-1">Notes</label><input type="text" value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="e.g. Settlement" className="w-full px-4 py-3 rounded-xl bg-white border border-[#2C3E50]/10 outline-none" /></div>
              <div className="flex gap-2 pt-2"><button type="submit" disabled={paymentSubmitting} className="flex-1 py-3 bg-[#8FA89B] text-white rounded-xl font-medium hover:bg-[#8FA89B]/90 transition-all disabled:opacity-70">{paymentSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Record"}</button><button type="button" onClick={() => setShowPaymentForm(false)} className="px-4 py-3 bg-white text-[#2C3E50] rounded-xl border border-[#2C3E50]/10">Cancel</button></div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
