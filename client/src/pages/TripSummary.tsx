import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { fetchData, AppData } from '@/lib/api';
import { calculateBalances, calculateSettlements } from '@/lib/settlement';
import type { Expense, Participant } from '@/lib/types';
import { printTripSummary, downloadTripSummary, generateTripSummary } from '@/lib/pdfExport';
import { Loader2, FileText, Printer, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function TripSummary() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

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

  const handlePrint = () => {
    printTripSummary(data, balances, settlements);
  };

  const handleDownload = () => {
    downloadTripSummary(data, balances, settlements);
    toast.success('Trip summary downloaded!');
  };

  const tripStart = new Date(data.settings.tripStartDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const tripEnd = new Date(data.settings.tripEndDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const totalExpensesSgd = data.expenses.reduce((sum: number, e: Expense) => {
    const amountSgd = e.currency === 'SGD' ? e.amount : e.amount / data.settings.fxRate;
    return sum + amountSgd;
  }, 0);

  const totalCollected = data.participants.reduce((sum: number, p: Participant) => sum + p.amountPaidSgd, 0);

  return (
    <Layout>
      <div className="pt-12 px-6 pb-8">
        <h1 className="font-serif text-3xl text-[#2C3E50] mb-2">Trip Summary</h1>
        <p className="text-[#2C3E50]/60 text-sm mb-8">
          Complete financial report for Myoko 2026.
        </p>

        {/* Export Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button
            onClick={handlePrint}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-[#2C3E50]/10 hover:border-[#2C3E50]/30 transition-all active:scale-95"
          >
            <Printer size={24} className="text-[#2C3E50] mb-2" />
            <span className="text-xs font-medium text-[#2C3E50]">Print</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-[#2C3E50]/10 hover:border-[#2C3E50]/30 transition-all active:scale-95"
          >
            <Download size={24} className="text-[#2C3E50] mb-2" />
            <span className="text-xs font-medium text-[#2C3E50]">Download</span>
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-[#2C3E50]/10 hover:border-[#2C3E50]/30 transition-all active:scale-95"
          >
            <Eye size={24} className="text-[#2C3E50] mb-2" />
            <span className="text-xs font-medium text-[#2C3E50]">Preview</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#2C3E50]/5">
            <p className="text-xs text-[#2C3E50]/50 uppercase tracking-wider mb-1">Trip Duration</p>
            <p className="font-serif text-lg text-[#2C3E50]">{tripStart} to {tripEnd}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#2C3E50]/5">
            <p className="text-xs text-[#2C3E50]/50 uppercase tracking-wider mb-1">Participants</p>
            <p className="font-serif text-2xl text-[#2C3E50]">{data.participants.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#2C3E50]/5">
            <p className="text-xs text-[#2C3E50]/50 uppercase tracking-wider mb-1">Total Collected</p>
            <p className="font-serif text-lg text-[#2C3E50]">S${totalCollected.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#2C3E50]/5">
            <p className="text-xs text-[#2C3E50]/50 uppercase tracking-wider mb-1">Total Spent</p>
            <p className="font-serif text-lg text-[#2C3E50]">S${totalExpensesSgd.toFixed(2)}</p>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#2C3E50]/5 mb-8 overflow-auto max-h-96">
            <pre className="text-xs text-[#2C3E50] font-mono whitespace-pre-wrap break-words">
              {generateTripSummary(data, balances, settlements)}
            </pre>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-[#F5F5F0] rounded-xl p-4 border border-[#2C3E50]/5">
          <p className="text-xs font-bold uppercase text-[#2C3E50]/40 mb-3">Export Options</p>
          <div className="space-y-2 text-sm text-[#2C3E50]/60 leading-relaxed">
            <p>
              <span className="font-medium text-[#2C3E50]">Print:</span> Opens a print preview in your browser. You can save as PDF from your printer settings.
            </p>
            <p>
              <span className="font-medium text-[#2C3E50]">Download:</span> Saves a text file with the complete trip summary to your device.
            </p>
            <p>
              <span className="font-medium text-[#2C3E50]">Preview:</span> Shows a text preview of the report above.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
