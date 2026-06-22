import { motion } from 'framer-motion';
import { FileSignature, Camera, CheckSquare, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { DataTable } from '../components/DataTable';
import { PageTransition } from '../components/PageTransition';

const mockPod = [
  { id: 'POD-8821', order: 'ORD-2023-1001', client: 'Sri Balaji Traders', receiver: 'Rahul M.', time: '10:45 AM Today', status: 'verified', hasImage: true, hasSign: true },
  { id: 'POD-8820', order: 'ORD-2023-0998', client: 'Sunrise Supermart', receiver: 'Manager', time: '09:15 AM Today', status: 'verified', hasImage: true, hasSign: true },
  { id: 'POD-8819', order: 'ORD-2023-0995', client: 'City Central Mall', receiver: 'Security', time: '08:30 AM Today', status: 'pending_audit', hasImage: true, hasSign: false },
  { id: 'POD-8818', order: 'ORD-2023-0980', client: 'Royal Enterprises', receiver: 'Kiran', time: 'Yesterday', status: 'rejected', hasImage: false, hasSign: true }
];

export default function ProofOfDelivery() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => mockPod.filter(p => 
    p.client.toLowerCase().includes(search.toLowerCase()) || p.order.toLowerCase().includes(search.toLowerCase())
  ), [search]);

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Proof of Delivery</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Review driver submitted PODs, signatures, and delivery photos.</p>
      </div>

      <motion.section whileHover={{ y: -4 }} className="glass-panel relative rounded-xl p-5 transition-all duration-300">
        <div className="mb-4">
          <div className="relative group/search max-w-md">
            <Search className="absolute left-3 top-3 text-slate-400 transition-colors duration-300" size={18} />
            <input className="input pl-10" placeholder="Search Order ID or Client" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <DataTable rows={filtered} columns={[
          { key: 'id', label: 'POD ID', render: (row) => <span className="font-semibold text-indigo-600 dark:text-indigo-400">{row.id}</span> },
          { key: 'order', label: 'Order ID', render: (row) => <span className="font-mono text-xs">{row.order}</span> },
          { key: 'client', label: 'Client', render: (row) => <span className="font-semibold">{row.client}</span> },
          { key: 'receiver', label: 'Received By', render: (row) => <span>{row.receiver} <span className="text-xs text-slate-400 block">{row.time}</span></span> },
          { key: 'evidence', label: 'Evidence', render: (row) => (
            <div className="flex gap-2 text-slate-400">
              {row.hasSign ? <FileSignature size={18} className="text-emerald-500" title="Signature Captured" /> : <FileSignature size={18} />}
              {row.hasImage ? <Camera size={18} className="text-emerald-500" title="Photo Captured" /> : <Camera size={18} />}
            </div>
          )},
          { key: 'status', label: 'Audit Status', render: (row) => {
            if (row.status === 'verified') return <span className="text-emerald-600 font-semibold text-sm flex items-center gap-1"><CheckSquare size={14}/> Verified</span>;
            if (row.status === 'rejected') return <span className="text-rose-600 font-semibold text-sm">Rejected</span>;
            return <span className="text-amber-600 font-semibold text-sm">Pending Audit</span>;
          }},
          { key: 'actions', label: 'Actions', render: () => <button className="text-sm font-semibold text-brand-600 hover:underline">View Details</button> }
        ]} />
      </motion.section>
    </PageTransition>
  );
}
