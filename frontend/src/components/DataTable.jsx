import { motion } from 'framer-motion';

export function DataTable({ columns, rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-white/5 dark:text-slate-400">
            <tr>{columns.map((col) => <th className="whitespace-nowrap px-4 py-4 font-bold" key={col.key}>{col.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {rows.map((row, index) => (
              <motion.tr
                key={row.id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="group cursor-default transition-colors hover:bg-brand-50/50 dark:hover:bg-white/5"
              >
                {columns.map((col) => <td className="whitespace-nowrap px-4 py-3.5 text-slate-700 transition-colors group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white" key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>)}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
