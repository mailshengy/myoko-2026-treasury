import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { fetchData, AppData } from '@/lib/api';
import { calculateBalances, calculateSettlements } from '@/lib/settlement';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Settlement() {
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
  const settlements = calculateSettlements(balances);

  return (
    <Layout>
      <div className="pt-12 px-6 pb-8">
        <h1 className="font-serif text-3xl text-[#2C3E50] mb-2">Settlement</h1>
        <p className="text-[#2C3E50]/60 text-sm mb-8">
          Suggested transfers to settle all debts efficiently.
        </p>

        {settlements.length > 0 ? (
          <div className="space-y-4">
            {settlements.map((s, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-[#2C3E50]/5 relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                  <div className="text-center w-20">
                    <div className="w-10 h-10 mx-auto bg-[#C7826B]/10 rounded-full flex items-center justify-center text-[#C7826B] font-serif font-bold mb-2">
                      {s.from.charAt(0)}
                    </div>
                    <p className="text-sm font-medium text-[#2C3E50]">{s.from}</p>
                    <p className="text-[10px] text-[#2C3E50]/50 uppercase mt-1">Sends</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-4">
                    <p className="font-mono text-lg font-bold text-[#2C3E50] mb-2">
                      S${s.amountSgd.toFixed(2)}
                    </p>
                    <div className="w-full h-px bg-[#2C3E50]/10 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                        <ArrowRight size={16} className="text-[#2C3E50]/30" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center w-20">
                    <div className="w-10 h-10 mx-auto bg-[#8FA89B]/10 rounded-full flex items-center justify-center text-[#8FA89B] font-serif font-bold mb-2">
                      {s.to.charAt(0)}
                    </div>
                    <p className="text-sm font-medium text-[#2C3E50]">{s.to}</p>
                    <p className="text-[10px] text-[#2C3E50]/50 uppercase mt-1">Receives</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-[#8FA89B]/10 rounded-full flex items-center justify-center text-[#8FA89B] mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-serif text-xl text-[#2C3E50] mb-2">All Settled!</h3>
            <p className="text-[#2C3E50]/60 text-sm max-w-[200px]">
              Everyone is square. No transfers needed.
            </p>
          </div>
        )}

        <div className="mt-8 p-4 bg-[#F5F5F0] rounded-xl border border-[#2C3E50]/5 text-center">
          <p className="text-xs text-[#2C3E50]/50 leading-relaxed">
            Calculated using a debt simplification algorithm to minimize the total number of transactions required.
          </p>
        </div>
      </div>
    </Layout>
  );
}
