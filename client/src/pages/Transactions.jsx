import React from 'react';

const transactions = [
  { id: 'tx-001', date: '2026-05-16', merchant: 'AWS', amount: -145000, category: 'Infrastructure', status: 'COMPLETED' },
  { id: 'tx-002', date: '2026-05-15', merchant: 'Zomato', amount: -850, category: 'Food', status: 'COMPLETED' },
  { id: 'tx-003', date: '2026-05-15', merchant: 'Uber', amount: -450, category: 'Transport', status: 'COMPLETED' },
  { id: 'tx-004', date: '2026-05-14', merchant: 'Salary', amount: 350000, category: 'Income', status: 'CLEARED' },
  { id: 'tx-005', date: '2026-05-13', merchant: 'Netflix', amount: -649, category: 'Subscription', status: 'COMPLETED' },
];

export default function Transactions() {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold font-mono neon-text-purple tracking-tight">Ledger Data</h1>
        <p className="text-gray-400 mt-2 font-mono">Immutable transaction logs</p>
      </header>

      <div className="glassmorphism rounded-xl overflow-hidden bg-black/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-glass-border bg-white/5 text-neon-cyan font-mono text-sm tracking-wider">
              <th className="p-4">TX_ID</th>
              <th className="p-4">DATE_TIME</th>
              <th className="p-4">ENTITY</th>
              <th className="p-4">CATEGORY</th>
              <th className="p-4 text-right">VALUE (₹)</th>
              <th className="p-4 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="font-mono text-sm">
            {transactions.map((tx, idx) => (
              <tr key={tx.id} className="border-b border-glass-border/50 hover:bg-white/5 transition-colors">
                <td className="p-4 text-gray-500">{tx.id}</td>
                <td className="p-4 text-gray-300">{tx.date}</td>
                <td className="p-4 text-white font-bold">{tx.merchant}</td>
                <td className="p-4 text-gray-400">{tx.category}</td>
                <td className={`p-4 text-right font-bold ${tx.amount > 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${tx.status === 'CLEARED' ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' : 'bg-gray-800 text-gray-400 border border-gray-600'}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
