import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal } from 'lucide-react';

export default function Login({ setAuth }) {
  const [bootText, setBootText] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const bootSequence = [
    'INIT FIN_ORACLE_OS v2.4.1',
    'LOADING MODULES...',
    'CONNECTING TO SECURE MAINFRAME...',
    'ESTABLISHING ENCRYPTED UPLINK...',
    'VERIFYING NEURAL NET INTEGRITY... OK',
    'SYSTEM READY.'
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootSequence.length) {
        setBootText(prev => [...prev, bootSequence[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowInput(true), 500);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (accessKey === 'admin') {
      localStorage.setItem('auth', 'true');
      setAuth(true);
      navigate('/dashboard');
    } else {
      setError('ACCESS DENIED: Invalid Key');
      setAccessKey('');
    }
  };

  return (
    <div className="h-screen bg-black text-neon-green font-mono flex items-center justify-center animate-flicker">
      <div className="absolute inset-0 scanlines pointer-events-none"></div>
      <div className="w-full max-w-2xl p-8 glassmorphism border-neon-green/30">
        <div className="flex items-center gap-4 mb-8 border-b border-neon-green/30 pb-4">
          <Terminal size={40} className="text-neon-purple" />
          <h1 className="text-3xl font-bold tracking-widest">FIN_ORACLE // TERMINAL</h1>
        </div>
        
        <div className="space-y-2 mb-8 min-h-[200px]">
          {bootText.map((text, i) => (
            <div key={i} className="opacity-80">{'>'} {text}</div>
          ))}
          {showInput && (
            <form onSubmit={handleLogin} className="mt-8 animate-pulse">
              <div className="flex flex-col gap-4">
                <label className="text-neon-purple font-bold uppercase">{'>'} ENTER ACCESS KEY:</label>
                <input
                  type="password"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="bg-transparent border-b-2 border-neon-green focus:outline-none w-64 text-xl tracking-[0.5em] text-white"
                  autoFocus
                />
              </div>
              {error && <div className="text-neon-red mt-4">{'>'} {error}</div>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
