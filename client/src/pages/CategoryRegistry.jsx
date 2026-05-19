import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Home, Activity, Utensils, Zap, CreditCard,
  ShoppingBag, Calendar, Tag, Banknote, TrendingUp, TrendingDown, Filter
} from 'lucide-react';

// ─── Static seed data per category ────────────────────────────────────────────

const RENT_DATA = [
  { id: 1, month: 'April 2025',    date: '2025-04-01', amount: 25000, mode: 'Bank Transfer', status: 'Paid' },
  { id: 2, month: 'March 2025',    date: '2025-03-01', amount: 25000, mode: 'UPI',           status: 'Paid' },
  { id: 3, month: 'February 2025', date: '2025-02-01', amount: 24500, mode: 'UPI',           status: 'Paid' },
  { id: 4, month: 'January 2025',  date: '2025-01-01', amount: 24500, mode: 'Cash',          status: 'Paid' },
  { id: 5, month: 'December 2024', date: '2024-12-01', amount: 24000, mode: 'Bank Transfer', status: 'Paid' },
  { id: 6, month: 'November 2024', date: '2024-11-01', amount: 24000, mode: 'UPI',           status: 'Paid' },
];

const TRANSPORT_DATA = [
  { id: 1,  label: 'Today',             date: '2025-05-18', description: 'Uber — Office commute',       amount: 180,  type: 'Ride' },
  { id: 2,  label: 'Yesterday',         date: '2025-05-17', description: 'Ola — Return trip',           amount: 250,  type: 'Ride' },
  { id: 3,  label: '16 May',            date: '2025-05-16', description: 'Metro Card recharge',         amount: 500,  type: 'Transit' },
  { id: 4,  label: '16 May',            date: '2025-05-16', description: 'Rapido — Quick commute',      amount: 85,   type: 'Ride' },
  { id: 5,  label: '15 May',            date: '2025-05-15', description: 'Uber Intercity',              amount: 1200, type: 'Ride' },
  { id: 6,  label: '14 May',            date: '2025-05-14', description: 'Auto — Market trip',          amount: 60,   type: 'Ride' },
  { id: 7,  label: '13 May',            date: '2025-05-13', description: 'Metro + Bus combo',           amount: 45,   type: 'Transit' },
  { id: 8,  label: '12 May',            date: '2025-05-12', description: 'Ola — Night surge',           amount: 340,  type: 'Ride' },
];

const FOOD_DATA = [
  { id: 1,  date: '2025-05-18', description: 'Swiggy — Biryani House',         category: 'Delivery',  amount: 450 },
  { id: 2,  date: '2025-05-17', description: 'Zomato — Burger Singh',          category: 'Delivery',  amount: 280 },
  { id: 3,  date: '2025-05-17', description: 'Starbucks — Morning coffee',     category: 'Cafe',      amount: 380 },
  { id: 4,  date: '2025-05-16', description: 'BigBasket — Monthly groceries',  category: 'Grocery',   amount: 3200 },
  { id: 5,  date: '2025-05-15', description: 'Blinkit — Instant grocery',      category: 'Grocery',   amount: 760 },
  { id: 6,  date: '2025-05-14', description: 'Swiggy Instamart',               category: 'Grocery',   amount: 520 },
  { id: 7,  date: '2025-05-13', description: 'Pizza Hut — Team lunch',         category: 'Dine-out',  amount: 1400 },
  { id: 8,  date: '2025-05-12', description: 'Zomato — Breakfast combo',       category: 'Delivery',  amount: 190 },
  { id: 9,  date: '2025-05-11', description: 'Local canteen',                  category: 'Dine-out',  amount: 90 },
  { id: 10, date: '2025-05-10', description: 'Zepto — Quick snacks',           category: 'Grocery',   amount: 340 },
];

const SUBSCRIPTION_DATA = [
  { id: 1,  date: '2025-05-01', description: 'Netflix Premium',       cycle: 'Monthly',  amount: 649,  status: 'Active' },
  { id: 2,  date: '2025-05-01', description: 'Spotify Duo',           cycle: 'Monthly',  amount: 179,  status: 'Active' },
  { id: 3,  date: '2025-05-03', description: 'GitHub Copilot',        cycle: 'Monthly',  amount: 833,  status: 'Active' },
  { id: 4,  date: '2025-05-05', description: 'Adobe Creative Cloud',  cycle: 'Monthly',  amount: 1675, status: 'Active' },
  { id: 5,  date: '2025-04-15', description: 'AWS — EC2 Instance',    cycle: 'Monthly',  amount: 2100, status: 'Active' },
  { id: 6,  date: '2025-04-20', description: 'Notion Pro',            cycle: 'Yearly',   amount: 320,  status: 'Active' },
  { id: 7,  date: '2025-03-01', description: 'LinkedIn Premium',      cycle: 'Monthly',  amount: 1599, status: 'Cancelled' },
];

const ENTERTAINMENT_DATA = [
  { id: 1,  date: '2025-05-17', description: 'PVR Cinemas — Avengers',    category: 'Movies',   amount: 860 },
  { id: 2,  date: '2025-05-15', description: 'BookMyShow — Concert',      category: 'Events',   amount: 2500 },
  { id: 3,  date: '2025-05-13', description: 'PlayStation Store — Game',  category: 'Gaming',   amount: 3499 },
  { id: 4,  date: '2025-05-10', description: 'Ludo Club — In-app',        category: 'Gaming',   amount: 199 },
  { id: 5,  date: '2025-05-08', description: 'INOX — Weekend flick',      category: 'Movies',   amount: 740 },
  { id: 6,  date: '2025-05-05', description: 'Steam — Summer sale',       category: 'Gaming',   amount: 1200 },
  { id: 7,  date: '2025-04-28', description: 'Escape room — Friends',     category: 'Events',   amount: 1800 },
  { id: 8,  date: '2025-04-20', description: 'Amazon Prime Video rent',   category: 'Streaming', amount: 149 },
];

const SHOPPING_DATA = [
  { id: 1,  date: '2025-05-16', description: 'Amazon — Wireless earbuds',   category: 'Electronics', amount: 2499 },
  { id: 2,  date: '2025-05-15', description: 'Myntra — Summer collection',  category: 'Clothing',    amount: 3200 },
  { id: 3,  date: '2025-05-12', description: 'Flipkart — Desk organizer',   category: 'Home',        amount: 899 },
  { id: 4,  date: '2025-05-10', description: 'Nykaa — Skincare kit',        category: 'Beauty',      amount: 1450 },
  { id: 5,  date: '2025-05-07', description: 'Decathlon — Gym gear',        category: 'Sports',      amount: 4500 },
  { id: 6,  date: '2025-05-04', description: 'IKEA — Shelf unit',           category: 'Home',        amount: 6800 },
  { id: 7,  date: '2025-04-30', description: 'Amazon — USB-C Hub',          category: 'Electronics', amount: 1299 },
];

// ─── Config map ────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG = {
  rent: {
    label: 'Rent',
    icon: Home,
    color: '#bc13fe',
    glowClass: 'shadow-[0_0_30px_rgba(188,19,254,0.3)]',
    borderClass: 'border-[#bc13fe]/40',
    textClass: 'text-[#bc13fe]',
    bgClass: 'bg-[#bc13fe]/10',
    data: RENT_DATA,
    total: RENT_DATA.reduce((s, r) => s + r.amount, 0),
    layout: 'rent',
  },
  transport: {
    label: 'Transport',
    icon: Activity,
    color: '#39FF14',
    glowClass: 'shadow-[0_0_30px_rgba(57,255,20,0.3)]',
    borderClass: 'border-[#39FF14]/40',
    textClass: 'text-neon-green',
    bgClass: 'bg-[#39FF14]/10',
    data: TRANSPORT_DATA,
    total: TRANSPORT_DATA.reduce((s, r) => s + r.amount, 0),
    layout: 'transport',
  },
  food: {
    label: 'Food',
    icon: Utensils,
    color: '#ff003c',
    glowClass: 'shadow-[0_0_30px_rgba(255,0,60,0.3)]',
    borderClass: 'border-[#ff003c]/40',
    textClass: 'text-neon-red',
    bgClass: 'bg-[#ff003c]/10',
    data: FOOD_DATA,
    total: FOOD_DATA.reduce((s, r) => s + r.amount, 0),
    layout: 'itemized',
  },
  subscription: {
    label: 'Subscription',
    icon: Zap,
    color: '#00ffff',
    glowClass: 'shadow-[0_0_30px_rgba(0,255,255,0.3)]',
    borderClass: 'border-neon-cyan/40',
    textClass: 'text-neon-cyan',
    bgClass: 'bg-neon-cyan/10',
    data: SUBSCRIPTION_DATA,
    total: SUBSCRIPTION_DATA.filter(r => r.status === 'Active').reduce((s, r) => s + r.amount, 0),
    layout: 'subscription',
  },
  entertainment: {
    label: 'Entertainment',
    icon: CreditCard,
    color: '#39FF14',
    glowClass: 'shadow-[0_0_30px_rgba(57,255,20,0.3)]',
    borderClass: 'border-[#39FF14]/40',
    textClass: 'text-neon-green',
    bgClass: 'bg-[#39FF14]/10',
    data: ENTERTAINMENT_DATA,
    total: ENTERTAINMENT_DATA.reduce((s, r) => s + r.amount, 0),
    layout: 'itemized',
  },
  shopping: {
    label: 'Shopping',
    icon: ShoppingBag,
    color: '#ff003c',
    glowClass: 'shadow-[0_0_30px_rgba(255,0,60,0.3)]',
    borderClass: 'border-[#ff003c]/40',
    textClass: 'text-neon-red',
    bgClass: 'bg-[#ff003c]/10',
    data: SHOPPING_DATA,
    total: SHOPPING_DATA.reduce((s, r) => s + r.amount, 0),
    layout: 'itemized',
  },
};

// ─── Helper components ─────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="glassmorphism rounded-xl p-5 flex flex-col gap-2 border border-white/10">
    <div className="flex items-center justify-between">
      <span className="text-xs font-mono uppercase tracking-wider text-gray-400">{label}</span>
      <Icon size={16} style={{ color }} />
    </div>
    <div className="font-mono font-bold text-2xl text-white">{value}</div>
    {sub && <div className="text-xs font-mono text-gray-500">{sub}</div>}
  </div>
);

const ModeChip = ({ mode }) => {
  const map = {
    'UPI': 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/5',
    'Cash': 'text-neon-green border-neon-green/30 bg-neon-green/5',
    'Bank Transfer': 'text-[#bc13fe] border-[#bc13fe]/30 bg-[#bc13fe]/5',
  };
  return (
    <span className={`px-2 py-0.5 rounded border font-mono text-xs ${map[mode] || 'text-gray-400 border-gray-700'}`}>
      {mode}
    </span>
  );
};

const TypeChip = ({ type, color }) => (
  <span
    className="px-2 py-0.5 rounded border font-mono text-xs"
    style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}
  >
    {type}
  </span>
);

// ─── Layout: Rent (month-by-month history) ────────────────────────────────────

const RentLayout = ({ data, cfg }) => (
  <div className="overflow-x-auto">
    <table className="w-full font-mono text-sm">
      <thead>
        <tr className="border-b border-white/10">
          <th className="text-left py-3 px-4 text-gray-400 uppercase text-xs tracking-wider">Month</th>
          <th className="text-left py-3 px-4 text-gray-400 uppercase text-xs tracking-wider">Date Paid</th>
          <th className="text-right py-3 px-4 text-gray-400 uppercase text-xs tracking-wider">Amount</th>
          <th className="text-center py-3 px-4 text-gray-400 uppercase text-xs tracking-wider">Mode</th>
          <th className="text-center py-3 px-4 text-gray-400 uppercase text-xs tracking-wider">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr
            key={row.id}
            className="border-b border-white/5 hover:bg-white/5 transition-colors group"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <td className="py-4 px-4 text-white font-medium">{row.month}</td>
            <td className="py-4 px-4 text-gray-400">{row.date}</td>
            <td className="py-4 px-4 text-right">
              <span className={`font-bold ${cfg.textClass}`}>₹{row.amount.toLocaleString()}</span>
            </td>
            <td className="py-4 px-4 text-center"><ModeChip mode={row.mode} /></td>
            <td className="py-4 px-4 text-center">
              <span className="px-2 py-0.5 rounded bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs">
                {row.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Layout: Transport (daily breakdown) ─────────────────────────────────────

const TransportLayout = ({ data, cfg }) => {
  const grouped = data.reduce((acc, row) => {
    if (!acc[row.label]) acc[row.label] = [];
    acc[row.label].push(row);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([label, rows], gi) => (
        <div key={label} className="glassmorphism rounded-xl border border-white/10 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between"
            style={{ background: `${cfg.color}08` }}>
            <span className="font-mono text-sm font-bold" style={{ color: cfg.color }}>
              {label}
            </span>
            <span className="font-mono text-xs text-gray-400">
              ₹{rows.reduce((s, r) => s + r.amount, 0).toLocaleString()} total
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {rows.map((row, i) => (
              <div key={row.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <div>
                    <p className="text-white font-mono text-sm">{row.description}</p>
                    <p className="text-gray-500 font-mono text-xs mt-0.5">{row.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TypeChip type={row.type} color={cfg.color} />
                  <span className="font-mono font-bold text-white text-sm">₹{row.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Layout: Subscription ────────────────────────────────────────────────────

const SubscriptionLayout = ({ data, cfg }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {data.map((row, i) => (
      <div
        key={row.id}
        className={`glassmorphism rounded-xl p-5 border ${row.status === 'Active' ? cfg.borderClass : 'border-white/10'} hover:scale-[1.02] transition-all duration-200`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-mono font-bold text-white text-sm">{row.description}</p>
            <p className="font-mono text-xs text-gray-500 mt-1">Billed {row.cycle} · Since {row.date}</p>
          </div>
          <span className={`px-2 py-0.5 rounded border text-xs font-mono ${
            row.status === 'Active'
              ? `${cfg.textClass} ${cfg.borderClass} ${cfg.bgClass}`
              : 'text-gray-500 border-gray-700 bg-gray-800/30'
          }`}>
            {row.status}
          </span>
        </div>
        <div className="flex items-baseline gap-1 mt-4">
          <span className={`text-lg font-mono ${cfg.textClass}`}>₹</span>
          <span className="text-2xl font-bold font-mono text-white">{row.amount.toLocaleString()}</span>
          <span className="text-xs text-gray-500 font-mono">/{row.cycle === 'Yearly' ? 'yr' : 'mo'}</span>
        </div>
      </div>
    ))}
  </div>
);

// ─── Layout: Itemized (Food / Entertainment / Shopping) ───────────────────────

const ItemizedLayout = ({ data, cfg }) => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(data.map(r => r.category))];
  const filtered = filter === 'All' ? data : data.filter(r => r.category === filter);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={14} className="text-gray-500" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${
              filter === cat
                ? `${cfg.textClass} ${cfg.borderClass} ${cfg.bgClass}`
                : 'text-gray-500 border-white/10 hover:text-white hover:border-white/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-gray-400 uppercase text-xs tracking-wider">Date</th>
              <th className="text-left py-3 px-4 text-gray-400 uppercase text-xs tracking-wider">Description</th>
              <th className="text-center py-3 px-4 text-gray-400 uppercase text-xs tracking-wider">Category</th>
              <th className="text-right py-3 px-4 text-gray-400 uppercase text-xs tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr
                key={row.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 px-4 text-gray-400 whitespace-nowrap">{row.date}</td>
                <td className="py-4 px-4 text-white">{row.description}</td>
                <td className="py-4 px-4 text-center">
                  <TypeChip type={row.category} color={cfg.color} />
                </td>
                <td className="py-4 px-4 text-right">
                  <span className={`font-bold ${cfg.textClass}`}>₹{row.amount.toLocaleString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function CategoryRegistry() {
  const { category } = useParams();
  const navigate = useNavigate();
  const cfg = CATEGORY_CONFIG[category?.toLowerCase()];

  if (!cfg) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center font-mono">
          <p className="text-neon-red text-2xl mb-4">404 — Category not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-neon-cyan underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const Icon = cfg.icon;
  const txCount = cfg.data.length;
  const avgAmount = cfg.total / txCount;

  // pick highest spend
  const highest = [...cfg.data].sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="flex-1 p-8 overflow-y-auto">

      {/* ── Back navigation ── */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-400 hover:text-white font-mono text-sm mb-8 group transition-colors"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
          style={{ color: cfg.color }}
        />
        <span>Back to Dashboard</span>
      </button>

      {/* ── Header ── */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${cfg.bgClass} border ${cfg.borderClass} ${cfg.glowClass}`}
          >
            <Icon size={28} style={{ color: cfg.color }} />
          </div>
          <div>
            <h1
              className="text-4xl font-bold font-mono tracking-tight text-white"
              style={{ textShadow: `0 0 10px ${cfg.color}80` }}
            >
              {cfg.label.toUpperCase()}
            </h1>
            <p className="text-gray-400 font-mono text-sm mt-1 tracking-wider uppercase">
              Registry &amp; Analysis · {txCount} records
            </p>
          </div>
        </div>

        {/* Neon divider */}
        <div
          className="h-px w-full mt-6 rounded"
          style={{ background: `linear-gradient(90deg, ${cfg.color}80, transparent)` }}
        />
      </header>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Spend"
          value={`₹${cfg.total.toLocaleString()}`}
          icon={Banknote}
          color={cfg.color}
          sub="All recorded transactions"
        />
        <StatCard
          label="Transactions"
          value={txCount}
          icon={Tag}
          color={cfg.color}
          sub="Logged entries"
        />
        <StatCard
          label="Avg per Entry"
          value={`₹${Math.round(avgAmount).toLocaleString()}`}
          icon={TrendingUp}
          color={cfg.color}
          sub="Mean transaction size"
        />
        <StatCard
          label="Highest Single"
          value={`₹${highest.amount.toLocaleString()}`}
          icon={TrendingDown}
          color={cfg.color}
          sub={highest.description || highest.month}
        />
      </div>

      {/* ── Detail panel ── */}
      <div
        className={`glassmorphism rounded-xl border ${cfg.borderClass} ${cfg.glowClass} p-6`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-mono text-lg uppercase tracking-widest flex items-center gap-2"
            style={{ color: cfg.color }}
          >
            <Calendar size={18} style={{ color: cfg.color }} />
            Transaction Log
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: cfg.color }} />
            <span className="text-xs font-mono uppercase tracking-widest text-gray-400">Live</span>
          </div>
        </div>

        {/* Layout switch */}
        {cfg.layout === 'rent'         && <RentLayout         data={cfg.data} cfg={cfg} />}
        {cfg.layout === 'transport'    && <TransportLayout    data={cfg.data} cfg={cfg} />}
        {cfg.layout === 'subscription' && <SubscriptionLayout data={cfg.data} cfg={cfg} />}
        {cfg.layout === 'itemized'     && <ItemizedLayout     data={cfg.data} cfg={cfg} />}
      </div>
    </div>
  );
}
