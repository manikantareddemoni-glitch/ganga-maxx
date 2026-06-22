import { motion } from 'framer-motion';
import { FileSearch, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { KpiCard } from '../components/KpiCard';

export default function KycVerification() {
  const pending = [
    { id: 'KYC-2023-088', company: 'Global Traders Pvt Ltd', submitted: '2 hours ago', risk: 'low', type: 'Credit Expansion' },
    { id: 'KYC-2023-089', company: 'Nexus Retail Mart', submitted: '5 hours ago', risk: 'high', type: 'New Onboarding' },
    { id: 'KYC-2023-090', company: 'Prime Cleaning Solutions', submitted: '1 day ago', risk: 'medium', type: 'New Onboarding' }
  ];

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">KYC Verification</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Review corporate documents, PAN/GST, and approve B2B onboarding.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Pending Reviews" value={18} icon={FileSearch} tone="amber" />
        <KpiCard label="Approved Today" value={5} icon={CheckCircle2} tone="emerald" delay={0.05} />
        <KpiCard label="High Risk Flags" value={2} icon={ShieldAlert} tone="rose" delay={0.1} />
      </div>

      <div className="grid gap-5">
        {pending.map((app, idx) => (
          <motion.div 
            key={app.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-6 rounded-xl border border-slate-200 dark:border-white/10 hover:border-brand-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">{app.id}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${app.risk === 'high' ? 'bg-rose-100 text-rose-700' : app.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {app.risk.toUpperCase()} RISK
                </span>
              </div>
              <h3 className="text-lg font-bold">{app.company}</h3>
              <p className="text-sm text-slate-500">{app.type} &bull; Submitted {app.submitted}</p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                View Documents
              </button>
              <button className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors" title="Reject">
                <XCircle size={20} />
              </button>
              <button className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors" title="Approve">
                <CheckCircle2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </PageTransition>
  );
}
