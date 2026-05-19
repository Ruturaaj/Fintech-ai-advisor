import React from 'react';
import { Activity, CreditCard, ShoppingBag, Utensils, Home, Zap, DollarSign } from 'lucide-react';

const categories = [
  { name: 'Food', amount: 1250.50, icon: Utensils, change: '+12%' },
  { name: 'Transport', amount: 450.00, icon: Activity, change: '-5%' },
  { name: 'Rent', amount: 2500.00, icon: Home, change: '0%' },
  { name: 'Subscription', amount: 120.99, icon: Zap, change: '+2%' },
  { name: 'Shopping', amount: 890.25, icon: ShoppingBag, change: '+18%' },
  { name: 'Entertainment', amount: 340.00, icon: CreditCard, change: '-10%' },
];

export default function Dashboard() {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold font-mono neon-text-purple tracking-tight">System Status: ONLINE</h1>
        <p className="text-gray-400 mt-2 font-mono">Financial matrix overview</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="glassmorphism p-6 rounded-xl hover:neon-border-green transition-all duration-300 group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/5 rounded-lg group-hover:bg-neon-green/10 transition-colors">
                <cat.icon className="w-6 h-6 text-neon-green" />
              </div>
              <span className={`text-sm font-mono ${cat.change.startsWith('+') ? 'text-neon-purple' : 'text-neon-green'}`}>
                {cat.change}
              </span>
            </div>
            
            <h3 className="text-gray-400 font-mono text-sm mb-1 uppercase tracking-wider">{cat.name}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-neon-green font-mono text-xl">$</span>
              <span className="text-3xl font-bold tracking-tight text-white">{cat.amount.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 glassmorphism p-6 rounded-xl">
        <h2 className="text-xl font-mono text-white mb-4 flex items-center gap-2">
          <DollarSign className="text-neon-purple" />
          Recent Anomalies
        </h2>
        <div className="space-y-3">
          <div className="p-4 bg-white/5 rounded-lg border border-red-500/30 flex justify-between items-center">
            <div>
              <p className="text-red-400 font-mono text-sm uppercase">Unusual Spike</p>
              <p className="text-white">AWS Cloud Services</p>
            </div>
            <span className="text-red-400 font-bold">-$1,450.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
