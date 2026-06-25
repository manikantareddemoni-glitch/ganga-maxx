import { motion } from 'framer-motion';
import { Edit, Plus, Search, Trash2, Users, CheckCircle, PauseCircle, Ban } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { PageTransition } from '../components/PageTransition';
import { RippleButton } from '../components/RippleButton';
import { Select } from '../components/Select';
import { KpiCard } from '../components/KpiCard';
import { customers as seed } from '../data/mockData';
import { currency } from '../lib/format';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const empty = { company_name: '', contact_name: '', email: '', phone: '', credit_limit: 0, payment_terms: 30, status: 'active', outstanding: 0 };

export default function Customers() {
  const { user } = useAuth();
  const [rows, setRows] = useState(seed);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const pageSize = 4;

  const fetchCustomers = () => {
    api.get('/customers?limit=1000').then(res => {
      if (res.data && res.data.data) setRows(res.data.data);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = useMemo(() => rows.filter((row) => {
    const matchesSearch = `${row.company_name} ${row.contact_name} ${row.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || row.status === status;
    return matchesSearch && matchesStatus;
  }), [rows, search, status]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const activeCount = rows.filter(r => r.status === 'active').length;
  const pausedCount = rows.filter(r => r.status === 'paused').length;
  const blockedCount = rows.filter(r => r.status === 'blocked').length;

  async function save() {
    try {
      if (editing.id) {
        await api.put(`/customers/${editing.id}`, editing);
      } else {
        await api.post('/customers', editing);
      }
      fetchCustomers();
      setEditing(null);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to save customer');
    }
  }

  const renderStatus = (status) => {
    if (status === 'active') return <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold capitalize text-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.2)] dark:bg-emerald-500/20 dark:text-emerald-300">{status}</span>;
    if (status === 'paused') return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold capitalize text-amber-700 shadow-[0_0_10px_rgba(245,158,11,0.2)] dark:bg-amber-500/20 dark:text-amber-300">{status}</span>;
    if (status === 'blocked') return <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold capitalize text-rose-700 shadow-[0_0_10px_rgba(225,29,72,0.2)] dark:bg-rose-500/20 dark:text-rose-300">{status}</span>;
    return <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize dark:bg-white/10">{status}</span>;
  };

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage B2B credit accounts, limits, payment terms, and status.</p>
        </div>
        {user?.role !== 'viewer' && (
          <RippleButton className="primary-btn" onClick={() => setEditing({ ...empty })}><Plus size={17} /> Add customer</RippleButton>
        )}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Customers" value={rows.length} icon={Users} tone="indigo" />
        <KpiCard label="Active Accounts" value={activeCount} icon={CheckCircle} tone="emerald" delay={0.05} />
        <KpiCard label="Paused Accounts" value={pausedCount} icon={PauseCircle} tone="amber" delay={0.1} />
        <KpiCard label="Blocked Accounts" value={blockedCount} icon={Ban} tone="rose" delay={0.15} />
      </div>

      <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-fuchsia-300 dark:hover:border-fuchsia-500/30">
        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-fuchsia-500/10 dark:from-fuchsia-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
          <div className="relative group/search">
            <Search className="absolute left-3 top-3 text-slate-400 transition-colors duration-300 group-focus-within/search:text-fuchsia-500" size={18} />
            <input className="input pl-10 transition-all duration-300 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 focus:shadow-[0_0_15px_rgba(217,70,239,0.15)]" placeholder="Search by company, contact, email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All status' },
              { value: 'active', label: 'Active' },
              { value: 'paused', label: 'Paused' },
              { value: 'blocked', label: 'Blocked' }
            ]}
          />
        </div>
        <DataTable rows={paged} columns={[
          { key: 'company_name', label: 'Company', render: (row) => <span className="font-semibold">{row.company_name}</span> },
          { key: 'contact_name', label: 'Contact' },
          { key: 'email', label: 'Email', render: (row) => <span className="text-slate-500 dark:text-slate-400">{row.email}</span> },
          { key: 'credit_limit', label: 'Credit Limit', render: (row) => <span className="font-medium">{currency(row.credit_limit)}</span> },
          { key: 'outstanding', label: 'Outstanding', render: (row) => <span className={row.outstanding > 0 ? 'font-medium text-amber-600 dark:text-amber-400' : ''}>{currency(row.outstanding)}</span> },
          { key: 'status', label: 'Status', render: (row) => renderStatus(row.status) },
          ...(user?.role !== 'viewer' ? [{ key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><motion.button whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }} className="icon-btn hover:text-brand-600 dark:hover:text-brand-400" onClick={() => setEditing(row)} title="Edit"><Edit size={16} /></motion.button><motion.button whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }} className="icon-btn hover:text-rose-500 dark:hover:text-rose-400" onClick={() => { setRows((items) => items.filter((item) => item.id !== row.id)); api.delete(`/customers/${row.id}`).then(fetchCustomers); }} title="Delete"><Trash2 size={16} /></motion.button></div> }] : [])
        ]} />
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Showing {paged.length} of {filtered.length}</span>
          <div className="flex gap-2">
            <RippleButton className="rounded-lg border px-3 py-2 font-semibold transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</RippleButton>
            <RippleButton className="rounded-lg border px-3 py-2 font-semibold transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5" disabled={page * pageSize >= filtered.length} onClick={() => setPage(page + 1)}>Next</RippleButton>
          </div>
        </div>
      </motion.section>
      <Modal open={Boolean(editing)} title={editing?.id ? 'Edit customer' : 'Add customer'} onClose={() => setEditing(null)}>
        {editing && <div className="grid gap-3 md:grid-cols-2">
          {['company_name', 'contact_name', 'email', 'phone'].map((field) => <input key={field} className="input" placeholder={field.replace('_', ' ')} value={editing[field]} onChange={(e) => setEditing({ ...editing, [field]: e.target.value })} />)}
          <input className="input" type="number" placeholder="Credit limit" value={editing.credit_limit} onChange={(e) => setEditing({ ...editing, credit_limit: Number(e.target.value) })} />
          <input className="input" type="number" placeholder="Payment terms" value={editing.payment_terms} onChange={(e) => setEditing({ ...editing, payment_terms: Number(e.target.value) })} />
          <Select
            className="md:col-span-2"
            value={editing.status}
            onChange={(val) => setEditing({ ...editing, status: val })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'paused', label: 'Paused' },
              { value: 'blocked', label: 'Blocked' }
            ]}
          />
          <RippleButton className="primary-btn md:col-span-2" onClick={save}>Save customer</RippleButton>
        </div>}
      </Modal>
    </PageTransition>
  );
}
