import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { fetchData, AppData } from '@/lib/api';
import { calculateBalances, calculateSettlements } from '@/lib/settlement';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettlementDetail {
  from: string;
  to: string;
  amountSgd: number;
  reason: string;
}

export default function SettlementDetails() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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

  // Generate detailed breakdown for each settlement
  const settlementDetails: SettlementDetail[] = settlements.map(s => {
    const fromBalance = balances.find(b => b.name === s.from);
    const toBalance = balances.find(b => b.name === s.to);
    
    return {
      from: s.from,
      to: s.to,
      amountSgd: s.amountSgd,
      reason: `${s.from} paid S$${fromBalance?.paidSgd || 0} upfront but only owes S$${fromBalance?.shareSgd.toFixed(0) || 0}, so they owe S$${s.amountSgd.toFixed(2)} to settle.`
    };
  });

  return (
    <Layout>
      <div className="pt-12 px-6 pb-8">
        <h1 className="font-serif text-3xl text-[#2C3E50] mb-2">Settlement Details</h1>
        <p className="text-[#2C3E50]/60 text-sm mb-8">
          Step-by-step breakdown of who needs to pay whom and why.
        </p>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#2C3E50]/5">
            <p className="text-xs text-[#2C3E50]/50 uppercase tracking-wider mb-1">Transactions</p>
            <p className="font-serif text-2xl text-[#2C3E50]">{settlements.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#2C3E50]/5">
            <p className="text-xs text-[#2C3E50]/50 uppercase tracking-wider mb-1">Total Moved</p>
            <p className="font-serif text-2xl text-[#2C3E50]">
              S${settlements.reduce((sum, s) => sum + s.amountSgd, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Settlement List */}
        <div className="space-y-3 mb-8">
          {settlementDetails.length > 0 ? (
            settlementDetails.map((detail, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-[#2C3E50]/5 overflow-hidden">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between hover:bg-[#F5F5F0] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#C7826B]/10 flex items-center justify-center text-[#C7826B] text-xs font-bold">
                        {detail.from.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-[#2C3E50]">{detail.from}</span>
                    </div>
                    <span className="text-[#2C3E50]/40 text-xs">→</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#2C3E50]">{detail.to}</span>
                      <div className="w-8 h-8 rounded-full bg-[#8FA89B]/10 flex items-center justify-center text-[#8FA89B] text-xs font-bold">
                        {detail.to.charAt(0)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#2C3E50]">
                      S${detail.amountSgd.toFixed(2)}
                    </span>
                    {expandedIndex === index ? (
                      <ChevronUp size={20} className="text-[#2C3E50]/40" />
                    ) : (
                      <ChevronDown size={20} className="text-[#2C3E50]/40" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedIndex === index && (
                  <div className="px-4 pb-4 border-t border-[#2C3E50]/5 bg-[#F5F5F0]">
                    <div className="space-y-3 pt-4">
                      {/* From Person Details */}
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs font-bold uppercase text-[#2C3E50]/40 mb-2">{detail.from}'s Breakdown</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#2C3E50]/60">Paid Upfront:</span>
                            <span className="font-mono font-medium text-[#2C3E50]">
                              S${balances.find(b => b.name === detail.from)?.paidSgd.toFixed(2) || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#2C3E50]/60">Fair Share:</span>
                            <span className="font-mono font-medium text-[#2C3E50]">
                              S${balances.find(b => b.name === detail.from)?.shareSgd.toFixed(2) || 0}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-[#2C3E50]/10">
                            <span className="text-[#2C3E50]/60">Net Balance:</span>
                            <span className="font-mono font-bold text-[#C7826B]">
                              S${balances.find(b => b.name === detail.from)?.netBalanceSgd.toFixed(2) || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* To Person Details */}
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs font-bold uppercase text-[#2C3E50]/40 mb-2">{detail.to}'s Breakdown</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#2C3E50]/60">Paid Upfront:</span>
                            <span className="font-mono font-medium text-[#2C3E50]">
                              S${balances.find(b => b.name === detail.to)?.paidSgd.toFixed(2) || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#2C3E50]/60">Fair Share:</span>
                            <span className="font-mono font-medium text-[#2C3E50]">
                              S${balances.find(b => b.name === detail.to)?.shareSgd.toFixed(2) || 0}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-[#2C3E50]/10">
                            <span className="text-[#2C3E50]/60">Net Balance:</span>
                            <span className="font-mono font-bold text-[#8FA89B]">
                              S${balances.find(b => b.name === detail.to)?.netBalanceSgd.toFixed(2) || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[#2C3E50]/40">
              <p>Everyone is settled! No transfers needed.</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-[#F5F5F0] rounded-xl p-4 border border-[#2C3E50]/5">
          <p className="text-xs font-bold uppercase text-[#2C3E50]/40 mb-3">How It Works</p>
          <div className="space-y-2 text-sm text-[#2C3E50]/60 leading-relaxed">
            <p>
              <span className="font-medium text-[#2C3E50]">Paid Upfront:</span> How much you contributed to the group pool at the start.
            </p>
            <p>
              <span className="font-medium text-[#2C3E50]">Fair Share:</span> Your equal portion of all group expenses.
            </p>
            <p>
              <span className="font-medium text-[#2C3E50]">Net Balance:</span> Positive = you should receive money. Negative = you owe money.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
