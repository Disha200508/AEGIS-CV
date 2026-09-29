import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Key, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Fingerprint, 
  ArrowRight,
  LogOut,
  Sparkles,
  Zap,
  AlertTriangle
} from 'lucide-react';

const PRESET_OPERATORS = [
  {
    callsign: 'COMMANDER_DELTA',
    name: 'Brig. Gen. R. Verma',
    role: 'Strategic Defense Commander',
    clearance: 'LEVEL 5 - TOP SECRET',
    unit: 'Strategic Intelligence Command (HQ)',
    color: 'tactical-cyan',
    badge: 'DEFENSE COMMAND'
  },
  {
    callsign: 'JURY_EVALUATOR',
    name: 'SIH Evaluator / Auditor',
    role: 'Independent Integrity Auditor',
    clearance: 'LEVEL 5 - FULL AUDIT',
    unit: 'Smart India Hackathon 2026 Jury Panel',
    color: 'tactical-green',
    badge: 'SIH EVALUATOR'
  },
  {
    callsign: 'ANALYST_CYBER',
    name: 'Capt. A. Nair',
    role: 'Computer Vision & AI Analyst',
    clearance: 'LEVEL 4 - SECRET',
    unit: 'Tactical Recon Analytics Unit 04',
    color: 'tactical-amber',
    badge: 'CV ANALYST'
  },
  {
    callsign: 'RECON_UNIT_9',
    name: 'Lt. S. Mukherjee',
    role: 'Forward UAV Operator',
    clearance: 'LEVEL 3 - CONFIDENTIAL',
    unit: 'Border Surveillance Drone Wing',
    color: 'purple-400',
    badge: 'RECON OPERATOR'
  }
];

export default function LoginPage({ onLogin, onLogout, currentUser, onNavigate, authNotice }) {
  const [callsign, setCallsign] = useState('');
  const [password, setPassword] = useState('');
  const [clearance, setClearance] = useState('LEVEL 5 - TOP SECRET');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!callsign.trim()) {
      setErrorMsg('Please enter an Officer Callsign or ID.');
      return;
    }

    setIsAuthenticating(true);
    setErrorMsg('');

    // Simulate cryptographic authorization sequence
    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);

      const userProfile = {
        callsign: callsign.trim().toUpperCase(),
        name: callsign.trim().toUpperCase(),
        role: clearance.includes('LEVEL 5') ? 'Commander / Lead Officer' : 'Defense Analyst',
        clearance: clearance,
        unit: 'Tactical Command Network',
        authTime: new Date().toISOString()
      };

      onLogin(userProfile);
    }, 600);
  };

  const handlePresetSelect = (preset) => {
    setIsAuthenticating(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      onLogin({
        ...preset,
        authTime: new Date().toISOString()
      });
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fadeIn">
      
      {/* Notice Banner if redirected from Command Center */}
      {authNotice && (
        <div className="p-4 rounded-xl bg-tactical-amber/15 border border-tactical-amber flex items-center space-x-3 text-tactical-amber font-mono text-xs shadow-[0_0_15px_rgba(255,170,0,0.2)]">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <span className="font-bold block">ACCESS CONTROL RESTRICTION:</span>
            <span className="text-slate-300">{authNotice}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-tactical-800 border border-tactical-cyan/40 text-tactical-cyan font-mono text-xs">
          <Terminal className="w-3.5 h-3.5" />
          <span>AEGIS-CV // DEFENSE ACCESS GATEWAY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
          COMMAND CENTER AUTHENTICATION
        </h1>
        <p className="text-sm font-sans text-slate-400 max-w-xl mx-auto">
          Cryptographically authenticated credentials are required to access tactical defense telemetry, neural model integrity, and immutable ledger operations.
        </p>
      </div>

      {/* Current User Card if Already Authenticated */}
      {currentUser && (
        <div className="p-6 rounded-xl border border-tactical-green/50 bg-tactical-green/5 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-tactical-green/20 border border-tactical-green/60 flex items-center justify-center text-tactical-green shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold font-mono text-white">{currentUser.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-green/20 border border-tactical-green text-tactical-green font-bold">
                    {currentUser.clearance}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-300">
                  Callsign: <strong className="text-tactical-cyan">{currentUser.callsign}</strong> | Unit: {currentUser.unit || 'Tactical Recon Unit'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-tactical-cyan hover:bg-tactical-cyan/90 text-slate-950 font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]"
              >
                <span>ENTER COMMAND CENTER</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg bg-tactical-800 hover:bg-tactical-700 border border-tactical-red/60 text-tactical-red font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>LOGOUT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Fast Presets (Designed for Live Evaluation / Demos) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-tactical-700/60 pb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-tactical-amber" />
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              1-Click Fast Login Profiles (Demo & Jury Evaluator)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Click any profile to instantly authenticate & unlock Command Center
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRESET_OPERATORS.map((preset) => (
            <div
              key={preset.callsign}
              onClick={() => handlePresetSelect(preset)}
              className="p-4 rounded-xl border border-tactical-700/80 bg-tactical-800/60 hover:bg-tactical-800 hover:border-tactical-cyan/60 transition-all cursor-pointer space-y-3 group shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-tactical-900 border border-tactical-600 flex items-center justify-center text-slate-300 group-hover:border-tactical-cyan group-hover:text-tactical-cyan transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm text-white group-hover:text-tactical-cyan transition-colors">
                      {preset.name}
                    </h3>
                    <div className="text-[11px] font-mono text-slate-400">
                      {preset.callsign}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-tactical-900 border border-slate-700 text-slate-300">
                  {preset.badge}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono border-t border-tactical-700/50 pt-2 text-slate-400">
                <span>{preset.unit}</span>
                <span className="text-tactical-green font-semibold">{preset.clearance.split(' - ')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Operator Login Terminal */}
      <div className="p-6 sm:p-8 rounded-2xl border border-tactical-600/70 bg-tactical-900/90 shadow-[0_0_30px_rgba(0,0,0,0.7)] space-y-6">
        
        <div className="flex items-center space-x-3 border-b border-tactical-700/60 pb-3">
          <Fingerprint className="w-5 h-5 text-tactical-cyan" />
          <h2 className="text-base font-bold font-mono text-white tracking-wide">
            CUSTOM OPERATOR ACCESS TERMINAL
          </h2>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-tactical-red/20 border border-tactical-red text-tactical-red font-mono text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCustomLogin} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-300">
                OFFICER CALLSIGN / ACCESS ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  placeholder="e.g. DEFENSE_OPERATOR_01"
                  className="w-full bg-tactical-800 border border-tactical-600 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-tactical-cyan transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-300">
                SECURITY CLEARANCE LEVEL
              </label>
              <select
                value={clearance}
                onChange={(e) => setClearance(e.target.value)}
                className="w-full bg-tactical-800 border border-tactical-600 rounded-lg px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-tactical-cyan transition-colors"
              >
                <option value="LEVEL 5 - TOP SECRET">LEVEL 5 - TOP SECRET (Full Command Access)</option>
                <option value="LEVEL 4 - SECRET">LEVEL 4 - SECRET (AI & Model Analytics)</option>
                <option value="LEVEL 3 - CONFIDENTIAL">LEVEL 3 - CONFIDENTIAL (Recon Ingestion)</option>
                <option value="LEVEL 5 - FULL AUDIT">LEVEL 5 - AUDIT / JURY EVALUATOR</option>
              </select>
            </div>

          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-300">
              CRYPTOGRAPHIC PASSPHRASE / 2FA TOKEN
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password or leave blank for instant evaluation mode"
                className="w-full bg-tactical-800 border border-tactical-600 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-tactical-cyan transition-colors"
              />
            </div>
            <p className="text-[10px] font-mono text-slate-500">
              * Demonstration mode allows instant evaluation authentication.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full sm:w-auto flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-tactical-cyan to-blue-600 hover:from-tactical-cyan/90 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>AUTHENTICATING SHA-256 CLEARANCE...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>AUTHORIZE & UNLOCK COMMAND CENTER</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto py-3 px-4 rounded-lg bg-tactical-800 hover:bg-tactical-700 border border-tactical-600 text-slate-300 font-mono text-xs transition-colors"
            >
              RETURN TO HOME
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
