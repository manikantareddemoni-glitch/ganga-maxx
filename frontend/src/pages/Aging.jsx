import { motion } from 'framer-motion';
import { useState } from 'react';
import { FileDown, Clock, Sparkles, Mail, MessageSquare, PenTool } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DataTable } from '../components/DataTable';
import { KpiCard } from '../components/KpiCard';
import { PageTransition } from '../components/PageTransition';
import { RippleButton } from '../components/RippleButton';
import { agingRows, dashboard } from '../data/mockData';
import { currency } from '../lib/format';
import { exportPdfWithCharts } from '../lib/exporters';
import { triggerBackendAction, api } from '../lib/api';
import { Modal } from '../components/Modal';
import { logoBase64 } from '../lib/logoBase64';

const colors = ['#6366f1', '#22d3ee', '#f59e0b', '#fb7185', '#10b981'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = data.payload?.fill || data.color || '#6366f1';
    const name = data.name === 'value' || data.name === 'amount' ? (label || data.name) : data.name;
    return (
      <div className="rounded-xl border-0 bg-white px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,.18)] dark:bg-slate-800">
        <p className="text-sm font-bold" style={{ color }}>
          {name} : {currency(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function Aging() {
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const [reminderModal, setReminderModal] = useState(null);
  const [reminderText, setReminderText] = useState('');
  const [loadingReminder, setLoadingReminder] = useState(false);
  
  const [notesModal, setNotesModal] = useState(null);
  const [shorthand, setShorthand] = useState('');
  const [expandedNote, setExpandedNote] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);

  async function exportReport() {
    await triggerBackendAction('export_aging_report', { rows: agingRows });
    exportPdfWithCharts('ganga-maxx-aging-report.pdf', agingRows, 'aging-chart-container');
  }

  async function generateAiSummary() {
    setLoadingSummary(true);
    try {
      const res = await api.post('/ai/aging-summary', { metrics: dashboard.aging });
      setAiSummary(res.data.summary);
    } catch (e) {
      console.error(e);
      setAiSummary('Failed to generate summary. Is the backend running with OPENAI_API_KEY?');
    }
    setLoadingSummary(false);
  }

  async function generateReminder(row) {
    setReminderModal(row);
    setLoadingReminder(true);
    setReminderText('');
    try {
      const res = await api.post('/ai/generate-reminder', {
        customer_name: row.company_name,
        outstanding: row.balance,
        days_overdue: row.days_overdue
      });
      setReminderText(res.data.message);
    } catch (e) {
      console.error(e);
      setReminderText('Failed to generate reminder. Check API key.');
    }
    setLoadingReminder(false);
  }

  async function expandNotes() {
    setLoadingNotes(true);
    try {
      const res = await api.post('/ai/expand-notes', { shorthand });
      setExpandedNote(res.data.expanded_note);
    } catch (e) {
      console.error(e);
      setExpandedNote('Failed to expand notes. Check API key.');
    }
    setLoadingNotes(false);
  }

  const agingDataWithColors = dashboard.aging.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length]
  }));

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
          <img src={logoBase64} alt="Logo" className="h-10 object-contain" />
          <div>
            <h1 className="text-2xl font-bold">Aging Report</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Current, 0-30, 31-60, 61-90, and 90+ day exposure analysis.</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <RippleButton className="primary-btn bg-brand-600 hover:bg-brand-500 group" onClick={exportReport}><FileDown size={17} className="transition-transform group-hover:-translate-y-0.5" /> Export PDF</RippleButton>
        </motion.div>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {dashboard.aging.map((item, index) => <KpiCard key={item.bucket} label={item.bucket} value={item.value} icon={Clock} tone={['indigo', 'cyan', 'amber', 'rose', 'emerald'][index]} money delay={index * 0.04} />)}
      </div>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-5">
        <div className="glass-panel relative rounded-xl p-6 border border-brand-500/30 shadow-[0_0_15px_rgba(217,70,239,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <Sparkles size={20} /> AI Aging Analysis
            </h2>
            <RippleButton className="primary-btn bg-brand-600 hover:bg-brand-500 text-sm" onClick={generateAiSummary} disabled={loadingSummary}>
              {loadingSummary ? 'Analyzing...' : 'Generate AI Summary'}
            </RippleButton>
          </div>
          {aiSummary ? (
            <div className="prose prose-sm dark:prose-invert max-w-none bg-brand-50 dark:bg-brand-500/5 p-4 rounded-lg text-slate-700 dark:text-slate-300">
              {aiSummary}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Click the button above to generate an executive AI summary of your current aging metrics.</p>
          )}
        </div>
      </motion.section>
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} whileHover={{ y: -4 }} className="glass-panel group relative mb-5 rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-purple-300 dark:hover:border-purple-500/30">
        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-purple-500/10 dark:from-purple-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <h2 className="mb-5 text-lg font-bold">Bucket Exposure</h2>
        <div id="aging-chart-container" className="h-72 bg-white dark:bg-transparent">
          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingDataWithColors}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
                <XAxis dataKey="bucket" stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(148,163,184,0.05)'}} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1500} animationEasing="ease-out">{dashboard.aging.map((item, index) => <Cell key={item.bucket} fill={colors[index]} className="transition-opacity hover:opacity-80 cursor-pointer" />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
        </div>
      </motion.section>
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-sky-300 dark:hover:border-sky-500/30">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-sky-500/10 dark:from-sky-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <DataTable rows={agingRows} columns={[
            { key: 'bucket', label: 'Bucket' },
            { key: 'company_name', label: 'Customer' },
            { key: 'invoice_no', label: 'Invoice' },
            { key: 'due_date', label: 'Due Date' },
            { key: 'days_overdue', label: 'Days Overdue', render: (row) => <span className={row.days_overdue > 60 ? 'font-bold text-rose-600 dark:text-rose-400' : 'font-semibold'}>{row.days_overdue}</span> },
            { key: 'priority', label: 'Priority', render: (row) => <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${row.priority === 'Critical' ? 'bg-rose-50 text-rose-700 shadow-[0_0_10px_rgba(225,29,72,0.15)] dark:bg-rose-500/15 dark:text-rose-300' : row.priority === 'High' ? 'bg-amber-50 text-amber-700 shadow-[0_0_10px_rgba(245,158,11,0.15)] dark:bg-amber-400/15 dark:text-amber-300' : 'bg-slate-50 text-slate-700 dark:bg-white/10 dark:text-slate-300'}`}>{row.priority}</span> },
            { key: 'balance', label: 'Balance', render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{currency(row.balance)}</span> },
            { key: 'actions', label: 'AI Actions', render: (row) => (
              <div className="flex gap-2">
                <button onClick={() => generateReminder(row)} className="icon-btn hover:text-brand-500 relative group/btn" title="Generate AI Reminder">
                  <Mail size={16} /><Sparkles size={10} className="absolute -top-1 -right-1 text-brand-400" />
                </button>
                <button onClick={() => { setNotesModal(row); setShorthand(''); setExpandedNote(''); }} className="icon-btn hover:text-brand-500 relative group/btn" title="AI Collection Notes">
                  <PenTool size={16} /><Sparkles size={10} className="absolute -top-1 -right-1 text-brand-400" />
                </button>
              </div>
            )}
          ]} />
      </motion.section>

      <Modal open={!!reminderModal} title="AI Follow-Up Reminder" onClose={() => setReminderModal(null)}>
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Generated email for {reminderModal?.company_name}</p>
          {loadingReminder ? (
            <div className="flex justify-center p-8"><Sparkles className="animate-pulse text-brand-500" size={32} /></div>
          ) : (
            <textarea className="input min-h-[150px] font-medium" value={reminderText} onChange={(e) => setReminderText(e.target.value)} />
          )}
          <RippleButton className="primary-btn w-full flex justify-center gap-2" disabled={loadingReminder}><Mail size={16} /> Send Email Reminder</RippleButton>
        </div>
      </Modal>

      <Modal open={!!notesModal} title="AI Collection Notes Generator" onClose={() => setNotesModal(null)}>
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Customer: {notesModal?.company_name}</p>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Shorthand Notes</label>
            <textarea className="input" placeholder="e.g., called rajesh, asked for 2 days ext, very sorry, will pay monday" value={shorthand} onChange={(e) => setShorthand(e.target.value)} />
          </div>
          <RippleButton className="primary-btn w-full flex justify-center gap-2 bg-brand-600 hover:bg-brand-500" onClick={expandNotes} disabled={loadingNotes || !shorthand}>
             <Sparkles size={16} /> {loadingNotes ? 'Expanding...' : 'Expand into Professional Log'}
          </RippleButton>
          
          {expandedNote && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider mt-4">Audit-Ready Note</label>
              <textarea className="input min-h-[100px] bg-slate-50 dark:bg-slate-800" value={expandedNote} onChange={(e) => setExpandedNote(e.target.value)} />
              <RippleButton className="w-full border border-slate-200 dark:border-white/10 rounded-lg py-2 mt-4 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                Save Note to Database
              </RippleButton>
            </motion.div>
          )}
        </div>
      </Modal>
    </PageTransition>
  );
}
