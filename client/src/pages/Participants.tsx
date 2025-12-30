import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { fetchData, AppData } from '@/lib/api';
import { calculateBalances } from '@/lib/settlement';
import { Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Participants() {
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
        </div>
      </Layout>
    );
  }

  if (!data) return null;

  const balances = calculateBalances(data.participants, data.expenses, data.settings);

  return (
    <Layout>
      <div className="pt-12 px-6 pb-8">
        <h1 className="font-serif text-3xl text-[#2C3E50] mb-2">Participants</h1>
        <p className="text-[#2C3E50]/60 text-sm mb-8">Track individual contributions and balances.</p>

        <div className="space-y-4">
          {balances.map((balance) => {
            const isPositive = balance.netBalanceSgd >= 0;
            
            return (
              <div key={balance.name} className="bg-white rounded-2xl p-5 shadow-sm border border-[#2C3E50]/5 relative overflow-hidden">
                {/* Decorative background element */}
                <div className={cn(
                  "absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 -mr-8 -mt-8",
                  isPositive ? "bg-[#8FA89B]" : "bg-[#C7826B]"
                )} />

                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5F5F0] flex items-center justify-center text-[#2C3E50]">
                      <User size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-[#2C3E50]">{balance.name}</h3>
                      <p className="text-xs text-[#2C3E50]/50">
                        Paid S${balance.paidSgd.toLocaleString()} • Used S${balance.shareSgd.toFixed(0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-[#2C3E50]/50 uppercase tracking-wider mb-1">Net Balance</p>
                    <p className={cn(
                      "font-mono text-lg font-medium",
                      isPositive ? "text-[#8FA89B]" : "text-[#C7826B]"
                    )}>
                      {isPositive ? '+' : ''}S${balance.netBalanceSgd.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar Visual */}
                <div className="mt-4 h-1.5 w-full bg-[#F5F5F0] rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full opacity-50", isPositive ? "bg-[#8FA89B]" : "bg-[#C7826B]")}
                    style={{ width: `${Math.min(100, (balance.paidSgd / balance.shareSgd) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
