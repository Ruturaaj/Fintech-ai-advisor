import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CreditCard, ShoppingBag, Utensils, Home, Zap, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const initialCategories = [
  { name: 'Food', amount: 12500.50, icon: Utensils, change: '+12%', progress: 85, color: '#ff003c' },
  { name: 'Transport', amount: 4500.00, icon: Activity, change: '-5%', progress: 40, color: '#39FF14' },
  { name: 'Rent', amount: 25000.00, icon: Home, change: '0%', progress: 100, color: '#bc13fe' },
  { name: 'Subscription', amount: 1200.99, icon: Zap, change: '+2%', progress: 30, color: '#00ffff' },
  { name: 'Shopping', amount: 8900.25, icon: ShoppingBag, change: '+18%', progress: 95, color: '#ff003c' },
  { name: 'Entertainment', amount: 3400.00, icon: CreditCard, change: '-10%', progress: 50, color: '#39FF14' },
];

const initialData = [
  { name: 'Mon', spend: 4000 },
  { name: 'Tue', spend: 3000 },
  { name: 'Wed', spend: 2000 },
  { name: 'Thu', spend: 2780 },
  { name: 'Fri', spend: 1890 },
  { name: 'Sat', spend: 2390 },
  { name: 'Sun', spend: 3490 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState('Transport');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [categoriesUI, setCategoriesUI] = useState(initialCategories);
  const [chartDataUI, setChartDataUI] = useState(initialData);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:8000/transactions');
      if (res.ok) {
        const txs = await res.json();
        const categoryMap = {};
        const dayMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        
        txs.forEach(tx => {
           const amt = Math.abs(tx.amount);
           if (!categoryMap[tx.category]) categoryMap[tx.category] = 0;
           categoryMap[tx.category] += amt;
           
           if (tx.date) {
             const d = new Date(tx.date);
             const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
             if (dayMap[dayName] !== undefined) {
               dayMap[dayName] += amt;
             }
           }
        });
        
        setCategoriesUI(initialCategories.map(c => ({
          ...c,
          amount: c.amount + (categoryMap[c.name] || 0)
        })));
        
        setChartDataUI(initialData.map(d => ({
          ...d,
          spend: d.spend + (dayMap[d.name] || 0)
        })));
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categoriesList = ['Transport', 'Rent', 'Entertainment', 'Shopping', 'Subscription', 'Food'];

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || !date || !category) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('http://localhost:8000/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, date, amount: parseFloat(amount) })
      });
      if (res.ok) {
        setMessage('Expense recorded successfully.');
        setAmount('');
        setTimeout(() => setIsAdding(false), 2000);
        fetchData();
      } else {
        setMessage('Failed to record expense.');
      }
    } catch (err) {
      setMessage('Error connecting to mainframe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold font-mono neon-text-purple tracking-tight">System Status: ONLINE</h1>
          <p className="text-gray-400 mt-2 font-mono">Financial matrix overview</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {categoriesUI.map((cat, idx) => (
          <div
            key={idx}
            onClick={() => navigate(`/registry/${cat.name.toLowerCase()}`)}
            className="glassmorphism p-6 rounded-xl hover:-translate-y-2 hover:shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all duration-300 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <cat.icon size={120} />
            </div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="relative">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                  <circle cx="24" cy="24" r="20" stroke={cat.color} strokeWidth="4" fill="none" strokeDasharray="125" strokeDashoffset={125 - (125 * cat.progress) / 100} className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-white group-hover:text-neon-green transition-colors">
                  <cat.icon className="w-5 h-5" style={{color: cat.color}} />
                </div>
              </div>
              <span className={`text-sm font-mono px-2 py-1 rounded bg-black/40 ${cat.change.startsWith('+') ? 'text-neon-red' : 'text-neon-cyan'}`}>
                {cat.change}
              </span>
            </div>
            
            <h3 className="text-gray-400 font-mono text-sm mb-1 uppercase tracking-wider">{cat.name}</h3>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-neon-green font-mono text-xl">₹</span>
              <span className="text-3xl font-bold tracking-tight text-white font-mono">{cat.amount.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glassmorphism p-6 rounded-xl border-neon-cyan/20">
          <h2 className="text-xl font-mono text-neon-cyan mb-6 tracking-wide uppercase">Velocity Analysis</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDataUI} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ffff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00ffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#888" fontFamily="JetBrains Mono" fontSize={12} />
                <YAxis stroke="#888" fontFamily="JetBrains Mono" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050510', borderColor: '#00ffff', color: '#fff', fontFamily: 'JetBrains Mono' }}
                  itemStyle={{ color: '#00ffff' }}
                />
                <Area type="monotone" dataKey="spend" stroke="#00ffff" fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glassmorphism p-6 rounded-xl border-neon-cyan/30 relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col justify-between h-full">
            <div>
              <h2 className="text-xl font-mono text-neon-cyan mb-4 uppercase tracking-widest flex items-center gap-2">
                <Activity className="text-neon-cyan" />
                Data Entry
              </h2>
              
              {!isAdding ? (
                <button 
                  onClick={() => { setIsAdding(true); setMessage(''); }}
                  className="w-full py-6 mt-4 glassmorphism border-dashed border-2 border-neon-cyan/50 text-neon-cyan font-mono rounded hover:bg-neon-cyan/10 transition-colors uppercase tracking-wider group"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-2xl group-hover:scale-125 transition-transform">+</span> Add Expense
                  </span>
                </button>
              ) : (
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-neon-cyan uppercase tracking-wider">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-black/50 border border-glass-border rounded p-2 text-white font-mono focus:outline-none focus:border-neon-cyan transition-colors"
                    >
                      {categoriesList.map(c => <option key={c} value={c} className="bg-dark-bg">{c}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-neon-cyan uppercase tracking-wider">Date</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-black/50 border border-glass-border rounded p-2 text-white font-mono focus:outline-none focus:border-neon-cyan transition-colors"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-neon-cyan uppercase tracking-wider">Amount (₹)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-black/50 border border-glass-border rounded p-2 text-white font-mono focus:outline-none focus:border-neon-cyan transition-colors"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-2 bg-transparent border border-gray-500 text-gray-400 font-mono rounded uppercase tracking-wider hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-mono rounded uppercase tracking-wider hover:bg-neon-cyan hover:text-black transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Execute'}
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            {message && (
              <p className={`font-mono text-xs mt-4 ${message.includes('success') ? 'text-neon-green' : 'text-neon-red'}`}>
                {'>'} {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
