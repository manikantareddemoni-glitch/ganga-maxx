import { motion } from 'framer-motion';
import { Search, ShoppingCart, CheckCircle, Clock, Truck, FileText } from 'lucide-react';
import { useState, useMemo } from 'react';
import { DataTable } from '../components/DataTable';
import { PageTransition } from '../components/PageTransition';
import { KpiCard } from '../components/KpiCard';
import { Select } from '../components/Select';
import { currency } from '../lib/format';

const mockOrders = [
  { id: 'ORD-2023-1001', customer: 'Sri Balaji Traders', date: '2023-10-15', amount: 125000, items: 45, status: 'delivered' },
  { id: 'ORD-2023-1002', customer: 'Metro Fresh Retail', date: '2023-10-16', amount: 85000, items: 22, status: 'shipped' },
  { id: 'ORD-2023-1003', customer: 'Deccan Wholesale Co.', date: '2023-10-17', amount: 210000, items: 110, status: 'pending' },
  { id: 'ORD-2023-1004', customer: 'Sunrise Supermart', date: '2023-10-17', amount: 45000, items: 15, status: 'processing' },
  { id: 'ORD-2023-1005', customer: 'City Central Mall', date: '2023-10-18', amount: 350000, items: 200, status: 'pending' },
  { id: 'ORD-2023-1006', customer: 'Royal Enterprises', date: '2023-10-18', amount: 62000, items: 30, status: 'delivered' }
];

export default function SalesOrders() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const filtered = useMemo(() => mockOrders.filter(o => 
    (status === 'all' || o.status === status) &&
    (o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()))
  ), [search, status]);

  const renderStatus = (s) => {
    switch(s) {
      case 'delivered': return <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold capitalize text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">Delivered</span>;
      case 'shipped': return <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold capitalize text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">Shipped</span>;
      case 'processing': return <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold capitalize text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">Processing</span>;
      case 'pending': return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold capitalize text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">Pending</span>;
      default: return null;
    }
  };

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sales Orders</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage B2B customer orders and fulfillment.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Orders" value={245} icon={ShoppingCart} tone="indigo" />
        <KpiCard label="Pending Approval" value={12} icon={Clock} tone="amber" delay={0.05} />
        <KpiCard label="In Transit" value={8} icon={Truck} tone="cyan" delay={0.1} />
        <KpiCard label="Delivered Today" value={24} icon={CheckCircle} tone="emerald" delay={0.15} />
      </div>

      <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-brand-300 dark:hover:border-brand-500/30">
        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-brand-500/10 dark:from-brand-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
          <div className="relative group/search">
            <Search className="absolute left-3 top-3 text-slate-400 transition-colors duration-300 group-focus-within/search:text-brand-500" size={18} />
            <input className="input pl-10 transition-all duration-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20" placeholder="Search by Order ID or Customer" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' }
            ]}
          />
        </div>

        <DataTable rows={filtered} columns={[
          { key: 'id', label: 'Order ID', render: (row) => <span className="font-semibold text-brand-600 dark:text-brand-400">{row.id}</span> },
          { key: 'customer', label: 'Customer', render: (row) => <span className="font-semibold">{row.customer}</span> },
          { key: 'date', label: 'Date', render: (row) => <span className="text-slate-500 dark:text-slate-400">{row.date}</span> },
          { key: 'items', label: 'Items', render: (row) => <span className="text-slate-500">{row.items} units</span> },
          { key: 'amount', label: 'Amount', render: (row) => <span className="font-medium">{currency(row.amount)}</span> },
          { key: 'status', label: 'Status', render: (row) => renderStatus(row.status) },
          { key: 'actions', label: 'Actions', render: () => <button className="icon-btn hover:text-brand-600 dark:hover:text-brand-400"><FileText size={16} /></button> }
        ]} />
      </motion.section>
    </PageTransition>
  );
}
