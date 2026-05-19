import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Send, Terminal, LayoutDashboard, List, Settings } from 'lucide-react';

export default function Sidebar({ setAuth }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [decryptingText, setDecryptingText] = useState('');

  useEffect(() => {
    // Proactive Agent Init
    setMessages([
      { role: 'system', content: 'Financial Oracle initialized. Scanning anomalies...' }
    ]);
    
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'oracle', content: '⚠ WARNING: Detected a 300% spike in AWS costs. Shutdown non-essential instances?', isProactive: true }
      ]);
    }, 2000);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const phrases = ['Decrypting...', 'Processing...', 'Analyzing matrix...', 'Querying neural net...'];
    let i = 0;
    const interval = setInterval(() => {
      setDecryptingText(phrases[i % phrases.length]);
      i++;
    }, 800);
    return () => clearInterval(interval);
  }, [loading]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setQuery('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: userMessage })
      });
      
      const data = await response.json();
      
      setMessages(prev => [
        ...prev, 
        { role: 'oracle', content: data.advice, sources: data.source_ids, warnings: data.warnings }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev, 
        { role: 'error', content: 'Connection to Oracle failed. System offline.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 border-r border-glass-border glassmorphism flex flex-col h-screen backdrop-blur-[10px]">
      <div className="p-6 border-b border-glass-border">
        <h2 className="text-2xl font-mono font-bold neon-text-purple flex items-center gap-3">
          <Terminal className="text-neon-cyan" />
          FIN_ORACLE
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></div>
          <span className="text-xs font-mono text-neon-cyan uppercase tracking-widest">Active Connection</span>
        </div>
      </div>

      <nav className="p-4 border-b border-glass-border grid grid-cols-3 gap-2">
        <NavLink to="/dashboard" className={({isActive}) => `flex flex-col items-center p-2 rounded border font-mono text-xs transition-colors ${isActive ? 'bg-neon-purple/20 text-neon-purple border-neon-purple' : 'border-transparent text-gray-500 hover:text-white'}`}>
          <LayoutDashboard size={18} className="mb-1" /> CORE
        </NavLink>
        <NavLink to="/transactions" className={({isActive}) => `flex flex-col items-center p-2 rounded border font-mono text-xs transition-colors ${isActive ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan' : 'border-transparent text-gray-500 hover:text-white'}`}>
          <List size={18} className="mb-1" /> LEDGER
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => `flex flex-col items-center p-2 rounded border font-mono text-xs transition-colors ${isActive ? 'bg-gray-700/50 text-white border-gray-500' : 'border-transparent text-gray-500 hover:text-white'}`}>
          <Settings size={18} className="mb-1" /> CONFIG
        </NavLink>
      </nav>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] rounded-lg p-3 font-mono text-sm shadow-md ${
              msg.role === 'user' ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan' : 
              msg.role === 'error' ? 'bg-red-900/20 border border-neon-red/30 text-neon-red' :
              msg.role === 'system' ? 'text-gray-500 text-xs uppercase tracking-wider' :
              msg.isProactive ? 'bg-neon-red/10 border border-neon-red shadow-[0_0_10px_rgba(255,0,60,0.2)] text-white' :
              'bg-white/5 border border-glass-border text-gray-300'
            }`}>
              {msg.role === 'oracle' && <p className={`${msg.isProactive ? 'text-neon-red' : 'text-neon-purple'} text-xs mb-2 uppercase font-bold`}>Oracle Response:</p>}
              <div className="whitespace-pre-wrap">{msg.content}</div>
              
              {msg.warnings && msg.warnings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-glass-border">
                  <p className="text-neon-red text-xs font-bold mb-1">WARNINGS:</p>
                  <ul className="list-disc pl-4 text-xs text-red-300">
                    {msg.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-neon-cyan font-mono text-sm pl-2">
            <span className="animate-flicker">{'>'} {decryptingText}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="p-4 border-t border-glass-border bg-black/40">
        <div className="relative flex items-center">
          <span className="absolute left-3 text-neon-cyan font-mono">{'>'}</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-black/60 border border-glass-border rounded py-3 pl-8 pr-12 text-neon-cyan font-mono placeholder-gray-600 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all text-sm"
            placeholder="Query the oracle..."
          />
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            className="absolute right-2 p-2 text-gray-400 hover:text-neon-cyan disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
