import { motion } from 'framer-motion';
import { useState } from 'react';
import CountUp from 'react-countup';
import { FileDown, Printer } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageTransition } from '../components/PageTransition';
import { Select } from '../components/Select';
import { RippleButton } from '../components/RippleButton';
import { ledgerRows } from '../data/mockData';
import { currency, formatDateTime } from '../lib/format';
import { exportPdfWithCharts, printCurrentPage } from '../lib/exporters';
import { triggerBackendAction } from '../lib/api';
import { logoBase64 } from '../lib/logoBase64';

export default function Statement() {
  const [customer, setCustomer] = useState('sri_balaji');

  async function exportStatement() {
    await triggerBackendAction('export_statement', { rows: ledgerRows });
    exportPdfWithCharts('ganga-maxx-account-statement.pdf', ledgerRows);
  }

  async function printStatement() {
    await triggerBackendAction('print_statement');
    printCurrentPage();
  }

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold">Account Statement</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generate formal statements for your customers.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
          <RippleButton className="secondary-btn group" onClick={printStatement}><Printer size={17} className="transition-transform group-hover:scale-110" /> Print</RippleButton>
          <RippleButton className="primary-btn bg-brand-600 hover:bg-brand-500 group" onClick={exportStatement}><FileDown size={17} className="transition-transform group-hover:-translate-y-0.5" /> Export PDF</RippleButton>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} whileHover={{ y: -4 }} className="mb-6 grid gap-3 md:grid-cols-4 glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-amber-300 dark:hover:border-amber-500/30" data-html2canvas-ignore>
        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-amber-500/10 dark:from-amber-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <Select
          value={customer}
          onChange={setCustomer}
          options={[
            { value: 'sri_balaji', label: 'Sri Balaji Traders' },
            { value: 'metro_fresh', label: 'Metro Fresh Retail' }
          ]}
        />
        <input className="input transition-colors focus:border-amber-500 focus:ring-amber-500/20" type="date" defaultValue="2026-05-01" />
        <input className="input transition-colors focus:border-amber-500 focus:ring-amber-500/20" type="date" defaultValue="2026-06-08" />
        <RippleButton className="primary-btn w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100" onClick={() => triggerBackendAction('generate_statement')}>Generate Statement</RippleButton>
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="glass-panel relative overflow-hidden rounded-xl bg-white p-8 shadow-xl transition-all duration-500 dark:bg-slate-900 md:p-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/5 dark:from-orange-400/5 to-transparent" />
        
        {/* Decorative Glowing Watermark */}
        <motion.div 
          animate={{ rotate: [0, 360] }} 
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute -right-40 -top-40 z-0 opacity-[0.02] dark:opacity-[0.03] mix-blend-multiply dark:mix-blend-screen"
        >
          <svg width="600" height="600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
            <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="white" />
          </svg>
        </motion.div>

        <div className="relative z-10">
          <div className="mb-10 flex flex-col items-start justify-between border-b border-slate-100 pb-8 dark:border-white/5 sm:flex-row">
            <div className="flex items-center gap-3">
              <img src={logoBase64} alt="Logo" className="h-12 object-contain" />
              <div>
                <h2 className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-3xl font-black text-transparent dark:from-brand-400 dark:to-indigo-400">GANGA MAXX</h2>
                <p className="mt-1 text-sm font-semibold tracking-widest text-slate-400 uppercase">Statement of Account</p>
              </div>
            </div>
            <div className="mt-6 text-left sm:mt-0 sm:text-right">
              <p className="text-xl font-bold text-slate-800 dark:text-white">Sri Balaji Traders</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">GSTIN: 29AABCS1429B1Z</p>
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Period: <span className="font-bold text-brand-600 dark:text-brand-400">May 1, 2026 — Jun 8, 2026</span></p>
            </div>
          </div>

          <div className="mb-10 grid gap-6 sm:grid-cols-3">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase text-slate-500">Opening Balance</p>
              <div className="mt-1 text-xl font-medium text-slate-700 dark:text-slate-300 flex items-center">
                <span className="mr-0.5">₹</span><CountUp end={125000} duration={2} separator="," />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase text-slate-500">Total Billed</p>
              <div className="mt-1 text-xl font-medium text-rose-600 dark:text-rose-400 flex items-center">
                <span className="mr-0.5">₹</span><CountUp end={428000} duration={2} separator="," />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="relative overflow-hidden rounded-lg bg-brand-50 p-4 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:ring-brand-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent" />
              <p className="relative z-10 text-xs font-semibold uppercase text-brand-600 dark:text-brand-400">Closing Balance Due</p>
              <div className="relative z-10 mt-1 text-2xl font-bold text-brand-700 dark:text-brand-300 flex items-center">
                <span className="mr-0.5">₹</span><CountUp end={428000} duration={2} separator="," />
              </div>
            </motion.div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
            <DataTable rows={ledgerRows} columns={[
              { key: 'transaction_date', label: 'Date & Time', render: (row) => <span className="text-sm font-medium whitespace-nowrap">{formatDateTime(row.transaction_date)}</span> },
              { key: 'reference_no', label: 'Ref / Invoice No', render: (row) => <span className="text-sm text-slate-500 dark:text-slate-400">{row.reference_no}</span> },
              { key: 'description', label: 'Description', render: (row) => <span className="text-sm">{row.description}</span> },
              { key: 'debit', label: 'Debit (₹)', render: (row) => <span className={row.debit > 0 ? 'text-rose-600 font-medium' : 'text-slate-300'}>{currency(row.debit)}</span> },
              { key: 'credit', label: 'Credit (₹)', render: (row) => <span className={row.credit > 0 ? 'text-emerald-600 font-medium' : 'text-slate-300'}>{currency(row.credit)}</span> },
              { key: 'running_balance', label: 'Balance', render: (row) => <span className="font-bold">{currency(row.running_balance)}</span> }
            ]} />
          </div>

          <div className="mt-8 flex flex-col items-center justify-center border-t border-dashed border-slate-200 pt-8 text-center dark:border-white/10">
            <p className="text-sm text-slate-500 dark:text-slate-400"><strong>Ganga Maxx</strong></p>
          </div>
        </div>
      </motion.section>
    </PageTransition>
  );
}
