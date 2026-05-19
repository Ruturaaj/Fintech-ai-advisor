import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, Database, Cpu } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth');
    window.location.href = '/';
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold font-mono neon-text-purple tracking-tight">System Configuration</h1>
        <p className="text-gray-400 mt-2 font-mono">Manage oracle parameters and security</p>
      </header>

      <div className="max-w-3xl space-y-6">
        <div className="glassmorphism p-6 rounded-xl">
          <h2 className="text-xl font-mono text-neon-cyan mb-4 flex items-center gap-2 border-b border-glass-border pb-2">
            <Shield size={20} /> Security & Access
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-mono">Neural Net Encryption</p>
                <p className="text-sm text-gray-400 font-mono">Quantum-resistant cipher status</p>
              </div>
              <span className="text-neon-green font-mono border border-neon-green px-2 py-1 rounded">ACTIVE</span>
            </div>
            <button 
              onClick={handleLogout}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-900/30 text-neon-red border border-neon-red/50 rounded hover:bg-neon-red hover:text-black transition-colors font-mono font-bold w-full justify-center uppercase tracking-widest"
            >
              <LogOut size={18} /> Terminate Session
            </button>
          </div>
        </div>

        <div className="glassmorphism p-6 rounded-xl opacity-70">
          <h2 className="text-xl font-mono text-gray-300 mb-4 flex items-center gap-2 border-b border-glass-border pb-2">
            <Database size={20} /> Data Sources [LOCKED]
          </h2>
          <p className="text-sm font-mono text-gray-500 mb-4">Requires Level 4 clearance to modify data pipeline integrations.</p>
        </div>
      </div>
    </div>
  );
}
