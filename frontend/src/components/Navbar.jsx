import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, RefreshCw, Zap, Terminal, Radio } from 'lucide-react';

export default function Navbar({ onOpenSimulator, onRestoreState, isRestoring, violationsCount }) {
  return (
    <header className="border-b border-tactical-600/60 bg-tactical-900/95 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tactical-cyan/20 to-tactical-600/40 border border-tactical-cyan/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Shield className="w-5 h-5 text-tactical-cyan" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-wider text-lg text-white font-mono">AEGIS-CV</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-cyan/10 border border-tactical-cyan/40 text-tactical-cyan">
                SIH 2026 PS228
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">
              DEFENSE RECON & SUPPLY CHAIN INTEGRITY ASSURANCE
            </p>
          </div>
        </div>

        {/* Operational Indicators */}
        <div className="hidden md:flex items-center space-x-6 text-xs font-mono">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-tactical-800/80 border border-tactical-600/40">
            <Radio className="w-3.5 h-3.5 text-tactical-green animate-pulse" />
            <span className="text-slate-400">DEFENSE PROTOCOL:</span>
            <span className="text-tactical-green font-semibold">ACTIVE</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-tactical-800/80 border border-tactical-600/40">
            <Terminal className="w-3.5 h-3.5 text-tactical-cyan" />
            <span className="text-slate-400">ENCRYPTION:</span>
            <span className="text-tactical-cyan font-semibold">SHA-256 SEAL</span>
          </div>
        </div>

        {/* Action Controls: Simulator & Restore */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSimulator}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded text-xs font-mono font-medium transition-all shadow-sm ${
              violationsCount > 0
                ? 'bg-tactical-red/20 border border-tactical-red text-tactical-red hover:bg-tactical-red/30 animate-pulse'
                : 'bg-tactical-800 border border-tactical-amber/60 text-tactical-amber hover:bg-tactical-amber/10'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>ATTACK SIMULATOR</span>
            {violationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-tactical-red text-white text-[10px] font-bold">
                {violationsCount} ALERT
              </span>
            )}
          </button>

          <button
            onClick={onRestoreState}
            disabled={isRestoring}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded text-xs font-mono font-medium bg-tactical-700/60 hover:bg-tactical-600/60 border border-tactical-500/50 text-slate-200 transition-all disabled:opacity-50"
            title="Reset all demo assets, models, and records back to clean verified state"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-tactical-cyan ${isRestoring ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">RESTORE CLEAN STATE</span>
          </button>
        </div>

      </div>
    </header>
  );
}
