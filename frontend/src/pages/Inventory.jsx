import { motion } from 'framer-motion';
import { Package, Search, AlertTriangle, ArrowDownToLine, Layers } from 'lucide-react';
import { useState, useMemo } from 'react';
import { DataTable } from '../components/DataTable';
import { PageTransition } from '../components/PageTransition';
import { KpiCard } from '../components/KpiCard';

const mockInventory = [
  { sku: 'CLN-FLR-001', name: 'Industrial Floor Cleaner 5L', category: 'Chemicals', stock: 1250, min: 500, loc: 'A-12-01' },
  { sku: 'SNT-HND-005', name: 'Hand Sanitizer Gel 1L', category: 'Hygiene', stock: 320, min: 400, loc: 'B-04-03' },
  { sku: 'PPS-GLV-002', name: 'Nitrile Gloves L (100pk)', category: 'PPE', stock: 8500, min: 2000, loc: 'C-01-05' },
  { sku: 'EQP-MOP-010', name: 'Microfiber Mop Pro', category: 'Equipment', stock: 45, min: 100, loc: 'D-08-01' },
  { sku: 'CLN-GLS-002', name: 'Glass Cleaner Spray 500ml', category: 'Chemicals', stock: 2100, min: 800, loc: 'A-15-02' }
];

export default function Inventory() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => mockInventory.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())
  ), [search]);

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Warehouse Inventory</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Real-time stock monitoring and reorder alerts.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total SKUs" value={452} icon={Layers} tone="indigo" />
        <KpiCard label="Units in Stock" value={145890} icon={Package} tone="cyan" delay={0.05} />
        <KpiCard label="Low Stock Alerts" value={24} icon={AlertTriangle} tone="rose" delay={0.1} />
        <KpiCard label="Incoming Stock" value={12500} icon={ArrowDownToLine} tone="emerald" delay={0.15} />
      </div>

      <motion.section whileHover={{ y: -4 }} className="glass-panel group relative rounded-xl p-5 transition-all duration-300 hover:shadow-glow-hover hover:border-cyan-300 dark:hover:border-cyan-500/30">
        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-cyan-500/10 dark:from-cyan-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <div className="mb-4">
          <div className="relative group/search max-w-md">
            <Search className="absolute left-3 top-3 text-slate-400 transition-colors duration-300 group-focus-within/search:text-cyan-500" size={18} />
            <input className="input pl-10 transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20" placeholder="Search SKU or Product Name" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <DataTable rows={filtered} columns={[
          { key: 'sku', label: 'SKU', render: (row) => <span className="font-mono text-xs font-semibold text-cyan-600 dark:text-cyan-400">{row.sku}</span> },
          { key: 'name', label: 'Product Name', render: (row) => <span className="font-semibold">{row.name}</span> },
          { key: 'category', label: 'Category', render: (row) => <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">{row.category}</span> },
          { key: 'loc', label: 'Location', render: (row) => <span className="text-slate-500">{row.loc}</span> },
          { key: 'stock', label: 'Stock Level', render: (row) => (
            <div className="flex items-center gap-2">
              <span className={`font-bold ${row.stock <= row.min ? 'text-rose-500' : 'text-emerald-500'}`}>{row.stock}</span>
              {row.stock <= row.min && <AlertTriangle size={14} className="text-rose-500" />}
            </div>
          )},
          { key: 'min', label: 'Min Level', render: (row) => <span className="text-slate-400">{row.min}</span> }
        ]} />
      </motion.section>
    </PageTransition>
  );
}
