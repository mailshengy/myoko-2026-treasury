import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { fetchData, AppData } from '@/lib/api';
import { Loader2, Plus, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Payments() {
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

  const payments: typeof data.payments = data.payments || [];
  const sortedPayments = [...payments].sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Layout>
      <div className="pt-12 px-6 pb-8">
        <h1 className="font-serif text-3xl text-[#2C3E50] mb-2">Payment Tracking</h1>
        <p className="text-[#2C3E50]/60 text-sm mb-8">
          Record actual payments made between members.
        </p>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#2C3E50]/5">
            <p className="text-xs text-[#2C3E50]/50 uppercase tracking-wider mb-1">Total Paid</p>
            <p className="font-serif text-2xl text-[#2C3E50]">
              S${payments.reduce((sum: number, p: any) => sum + (p.currency === 'SGD' ? p.amount : p.amount / (data.settings.fxRate || 1)), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#2C3E50]/5">
            <p className="text-xs text-[#2C3E50]/50 uppercase tracking-wider mb-1">Transactions</p>
            <p className="font-serif text-2xl text-[#2C3E50]">{payments.length}</p>
          </div>
        </div>

        {/* Payments List */}
        {sortedPayments.length > 0 ? (
          <div className="space-y-3 mb-8">
            {sortedPayments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-xl p-4 shadow-sm border border-[#2C3E50]/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-[#F5F5F0] rounded-lg text-[#2C3E50]/70">
                      <span className="text-[10px] font-bold uppercase">
                        {new Date(payment.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-serif leading-none">
                        {new Date(payment.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#2C3E50]">{payment.from}</span>
                        <span className="text-[#2C3E50]/40 text-sm">→</span>
                        <span className="font-medium text-[#2C3E50]">{payment.to}</span>
                      </div>
                      {payment.notes && (
                        <p className="text-xs text-[#2C3E50]/50">{payment.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#2C3E50] block">
                      {payment.currency === 'SGD' ? 'S$' : '¥'}{payment.amount.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <CheckCircle2 size={14} className="text-[#8FA89B]" />
                      <span className="text-[10px] text-[#8FA89B] uppercase font-medium">Settled</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-[#8FA89B]/10 rounded-full flex items-center justify-center text-[#8FA89B] mb-4">
              <Clock size={32} />
            </div>
            <h3 className="font-serif text-xl text-[#2C3E50] mb-2">No Payments Yet</h3>
            <p className="text-[#2C3E50]/60 text-sm max-w-[200px]">
              Payments will appear here as they are recorded.
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-[#F5F5F0] rounded-xl p-4 border border-[#2C3E50]/5">
          <p className="text-xs font-bold uppercase text-[#2C3E50]/40 mb-3">How to Record Payments</p>
          <div className="space-y-2 text-sm text-[#2C3E50]/60 leading-relaxed">
            <p>
              Payments are recorded in your Google Sheet to track actual transfers made between members.
            </p>
            <p>
              To add a payment:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[#2C3E50]/50">
              <li>Open your Google Sheet</li>
              <li>Go to the "Payments" sheet</li>
              <li>Add a new row with: Date, From (payer), To (receiver), Amount, Currency, Notes</li>
              <li>Save - it will appear here automatically</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
}
