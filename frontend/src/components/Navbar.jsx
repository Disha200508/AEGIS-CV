import React from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  Terminal, 
  Radio, 
  Home, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Lock 
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  onNavigate, 
  onOpenSimulator, 
  onRestoreState, 
  isRestoring, 
  violationsCount, 
  user, 
  onLogout 
}) {
  return (
    <header className="border-b border-tactical-600/60 bg-tactical-900/95 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tactical-cyan/20 to-tactical-600/40 border border-tactical-cyan/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)] group-hover:border-tactical-cyan transition-colors">
            <Shield className="w-5 h-5 text-tactical-cyan" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-wider text-lg text-white font-mono group-hover:text-tactical-cyan transition-colors">
                AEGIS-CV
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-cyan/10 border border-tactical-cyan/40 text-tactical-cyan">
                DEFENSE SECURE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
              DEFENSE RECON & SUPPLY CHAIN INTEGRITY ASSURANCE
            </p>
          </div>
        </div>

        {/* Navigation View Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2 font-mono text-xs">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'home'
                ? 'bg-tactical-800 text-tactical-cyan border border-tactical-cyan/50 font-bold shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-tactical-800/60 border border-transparent'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">HOME</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'dashboard'
                ? 'bg-tactical-800 text-tactical-cyan border border-tactical-cyan/50 font-bold shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-tactical-800/60 border border-transparent'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">COMMAND CENTER</span>
          </button>
        </div>

        {/* Action Controls: Simulator & Auth */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Attack Simulator Button */}
          <button
            onClick={onOpenSimulator}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 rounded text-xs font-mono font-medium transition-all shadow-sm ${
              violationsCount > 0
                ? 'bg-tactical-red/20 border border-tactical-red text-tactical-red hover:bg-tactical-red/30 animate-pulse'
                : 'bg-tactical-800 border border-tactical-amber/60 text-tactical-amber hover:bg-tactical-amber/10'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="hidden md:inline">ATTACK SIMULATOR</span>
            {violationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-tactical-red text-white text-[10px] font-bold">
                {violationsCount} ALERT
              </span>
            )}
          </button>

          {/* Restore Clean State */}
          <button
            onClick={onRestoreState}
            disabled={isRestoring}
            className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono font-medium bg-tactical-700/60 hover:bg-tactical-600/60 border border-tactical-500/50 text-slate-200 transition-all disabled:opacity-50"
            title="Reset all demo assets, models, and records back to clean verified state"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-tactical-cyan ${isRestoring ? 'animate-spin' : ''}`} />
            <span>RESTORE</span>
          </button>

          {/* User Auth Info / Login button */}
          {user ? (
            <div className="flex items-center space-x-2">
              <div 
                onClick={() => onNavigate('login')}
                className="flex items-center space-x-2 px-2.5 py-1 rounded bg-tactical-800 border border-tactical-green/40 hover:border-tactical-green cursor-pointer transition-colors"
                title={`${user.name} - ${user.clearance}`}
              >
                <div className="w-2 h-2 rounded-full bg-tactical-green animate-pulse" />
                <span className="font-mono text-xs text-slate-200 font-semibold max-w-[90px] sm:max-w-[130px] truncate">
                  {user.callsign}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded bg-tactical-800/80 hover:bg-tactical-700 border border-tactical-red/50 text-tactical-red hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold bg-tactical-800 hover:bg-tactical-700 border border-tactical-cyan/60 text-tactical-cyan transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>LOGIN</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
