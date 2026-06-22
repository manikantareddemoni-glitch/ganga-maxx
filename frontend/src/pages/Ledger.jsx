import { motion } from 'framer-motion';
import { useState } from 'react';
import { Download, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageTransition } from '../components/PageTransition';
import { Select } from '../components/Select';
import { KpiCard } from '../components/KpiCard';
import { RippleButton } from '../components/RippleButton';
import { ledgerRows } from '../data/mockData';
import { currency, formatDateTime } from '../lib/format';
import { exportPdfWithCharts } from '../lib/exporters';
import { triggerBackendAction } from '../lib/api';
import { logoBase64 } from '../lib/logoBase64';

export default function Ledger() {
  const [customer, setCustomer] = useState('sri_balaji');

  // Calculate totals from ledgerRows
  const totalDebits = ledgerRows.reduce((sum, row) => sum + row.debit, 0);
  const totalCredits = ledgerRows.reduce((sum, row) => sum + row.credit, 0);
  const netBalance = totalDebits - totalCredits;

  async function exportLedger() {
    await triggerBackendAction('export_ledger', { rows: ledgerRows });
    exportPdfWithCharts('ganga-maxx-ledger.pdf', ledgerRows);
  }

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src={logoBase64} alt="Logo" className="h-10 object-contain" />
          <div>
            <h1 className="text-2xl font-bold">Credit Ledger</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Customer debits, credits, and running balance history.</p>
          </div>
        </div>
        <div>
          <RippleButton className="primary-btn bg-brand-600 hover:bg-brand-500 group" onClick={exportLedger}><Download size={17} className="transition-transform group-hover:-translate-y-0.5" /> Export PDF</RippleButton>
        </div>
      </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <KpiCard label="Total Debits" value={totalDebits} icon={ArrowUpRight} tone="rose" money />
          <KpiCard label="Total Credits" value={totalCredits} icon={ArrowDownRight} tone="emerald" money delay={0.05} />
          <KpiCard label="Net Balance" value={Math.abs(netBalance)} icon={Activity} tone="indigo" money delay={0.1} />
        </div>

        <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-emerald-300 dark:hover:border-emerald-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-emerald-500/10 dark:from-emerald-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="mb-4 grid gap-3 md:grid-cols-3" data-html2canvas-ignore>
            <Select
              value={customer}
              onChange={setCustomer}
              options={[
                { value: 'sri_balaji', label: 'Sri Balaji Traders' },
                { value: 'metro_fresh', label: 'Metro Fresh Retail' }
              ]}
            />
            <input className="input transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20" type="date" defaultValue="2026-05-01" />
            <input className="input transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20" type="date" defaultValue="2026-06-08" />
          </div>
          <DataTable rows={ledgerRows} columns={[
            { key: 'transaction_date', label: 'Date & Time', render: (row) => <span className="font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">{formatDateTime(row.transaction_date)}</span> },
            { key: 'type', label: 'Type', render: (row) => (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${row.type === 'Debit' ? 'bg-rose-50 text-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.15)] dark:bg-rose-500/15 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.15)] dark:bg-emerald-500/15 dark:text-emerald-400'}`}>
                {row.type === 'Debit' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {row.type}
              </span>
            )},
            { key: 'reference_no', label: 'Reference' },
            { key: 'description', label: 'Description', render: (row) => <span className="text-slate-500 dark:text-slate-400">{row.description}</span> },
            { key: 'debit', label: 'Debit', render: (row) => <span className={row.debit > 0 ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-slate-300 dark:text-slate-600'}>{currency(row.debit)}</span> },
            { key: 'credit', label: 'Credit', render: (row) => <span className={row.credit > 0 ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}>{currency(row.credit)}</span> },
            { key: 'running_balance', label: 'Balance', render: (row) => <span className="font-bold text-slate-800 dark:text-white">{currency(row.running_balance)}</span> }
          ]} />
        </motion.section>
    </PageTransition>
  );
}
