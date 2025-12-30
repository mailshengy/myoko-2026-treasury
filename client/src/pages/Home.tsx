import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { fetchData, AppData } from '@/lib/api';
import { calculateBalances } from '@/lib/settlement';
import { Loader2, TrendingUp, Calendar, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

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
          <p className="font-serif italic">Loading Myoko Treasury...</p>
        </div>
      </Layout>
    );
  }

  if (!data) return null;

  const { settings, participants, expenses } = data;
  const balances = calculateBalances(participants, expenses, settings);
  
  // Calculate totals
  const totalCollectedSgd = participants.reduce((sum, p) => sum + p.amountPaidSgd, 0);
  const totalSpentSgd = expenses.reduce((sum, e) => {
    return sum + (e.currency === 'SGD' ? e.amount : e.amount / settings.fxRate);
  }, 0);
  
  const remainingSgd = totalCollectedSgd - totalSpentSgd;
  const remainingJpy = remainingSgd * settings.fxRate;
  
  // Budget Health
  const tripDuration = (new Date(settings.tripEndDate).getTime() - new Date(settings.tripStartDate).getTime()) / (1000 * 60 * 60 * 24) + 1;
  const daysPassed = Math.max(0, Math.min(tripDuration, (Date.now() - new Date(settings.tripStartDate).getTime()) / (1000 * 60 * 60 * 24)));
  const expectedSpendRatio = daysPassed / tripDuration;
  const actualSpendRatio = totalSpentSgd / totalCollectedSgd;
  
  let healthStatus = 'Comfortable';
  let healthColor = 'text-[#8FA89B]'; // Greenish
  
  if (actualSpendRatio > expectedSpendRatio + 0.1) {
    healthStatus = 'Over Budget';
    healthColor = 'text-[#C7826B]'; // Reddish
  } else if (actualSpendRatio > expectedSpendRatio) {
    healthStatus = 'Tight';
    healthColor = 'text-yellow-600';
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden rounded-b-[2rem] shadow-lg">
        <img 
          src="/images/hero-bg.jpg" 
          alt="Myoko" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="font-serif text-4xl mb-1 tracking-wide">Myoko 2026</h1>
          <p className="text-white/90 font-light tracking-widest text-sm uppercase">Treasury Dashboard</p>
        </div>
      </div>

      <div className="px-6 -mt-8 relative z-20 space-y-6">
        {/* Main Balance Card */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-sm border border-white/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-wider text-[#8FA89B] uppercase">Remaining Funds</span>
            <Wallet className="w-4 h-4 text-[#8FA89B]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-serif text-[#2C3E50]">¥{Math.floor(remainingJpy).toLocaleString()}</span>
          </div>
          <div className="mt-1 text-sm text-[#2C3E50]/60 font-mono">
            ≈ S${remainingSgd.toFixed(2)}
          </div>
          
          <div className="mt-6 pt-4 border-t border-dashed border-[#2C3E50]/10 flex justify-between text-sm">
            <div>
              <p className="text-xs text-[#2C3E50]/50 mb-1">Total Collected</p>
              <p className="font-medium text-[#2C3E50]">S${totalCollectedSgd.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#2C3E50]/50 mb-1">Total Spent</p>
              <p className="font-medium text-[#C7826B]">-S${totalSpentSgd.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Budget Health */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#F5F5F0] rounded-2xl p-5 border border-[#2C3E50]/5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#2C3E50]/60" />
              <span className="text-xs font-bold uppercase text-[#2C3E50]/60">Health</span>
            </div>
            <p className={cn("font-serif text-lg", healthColor)}>{healthStatus}</p>
            <p className="text-[10px] text-[#2C3E50]/50 mt-1 leading-tight">
              {Math.round(actualSpendRatio * 100)}% spent vs {Math.round(expectedSpendRatio * 100)}% time passed
            </p>
          </div>

          <div className="bg-[#F5F5F0] rounded-2xl p-5 border border-[#2C3E50]/5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#2C3E50]/60" />
              <span className="text-xs font-bold uppercase text-[#2C3E50]/60">Duration</span>
            </div>
            <p className="font-serif text-lg text-[#2C3E50]">{Math.ceil(tripDuration - daysPassed)} Days</p>
            <p className="text-[10px] text-[#2C3E50]/50 mt-1 leading-tight">
              Remaining of {tripDuration} days total
            </p>
          </div>
        </div>

        {/* Recent Activity Preview */}
        <div className="pb-8">
          <h3 className="font-serif text-lg text-[#2C3E50] mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#C7826B] rounded-full" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {expenses.slice(0, 3).map((expense) => (
              <div key={expense.id} className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm border border-transparent hover:border-[#8FA89B]/30 transition-colors">
                <div>
                  <p className="font-medium text-[#2C3E50]">{expense.description}</p>
                  <p className="text-xs text-[#2C3E50]/50 mt-0.5">
                    {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • Paid by {expense.paidBy}
                  </p>
                </div>
                <span className="font-mono text-sm text-[#2C3E50]">
                  {expense.currency === 'JPY' ? '¥' : 'S$'}{expense.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
