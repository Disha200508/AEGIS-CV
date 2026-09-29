import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import StatusOverview from './components/StatusOverview';
import DataIntegrityPanel from './components/DataIntegrityPanel';
import ModelIntegrityPanel from './components/ModelIntegrityPanel';
import InferencePanel from './components/InferencePanel';
import AuditLedgerView from './components/AuditLedgerView';
import TamperSimulationModal from './components/TamperSimulationModal';

import {
  getOverviewStats,
  listAssets,
  getActiveModel,
  listInferenceRecords,
  listLedgerBlocks,
  restoreDemoState
} from './services/api';

import { Database, Cpu, Eye, Link as LinkIcon, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function App() {
  // Navigation: 'home' | 'dashboard' | 'login'
  const [currentView, setCurrentView] = useState('home');
  const [activeTab, setActiveTab] = useState('data');
  const [targetTabAfterLogin, setTargetTabAfterLogin] = useState('data');
  const [authNotice, setAuthNotice] = useState('');

  // User authentication state (stored in localStorage)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aegis_cv_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [overview, setOverview] = useState(null);
  const [assets, setAssets] = useState([]);
  const [model, setModel] = useState(null);
  const [inferenceRecords, setInferenceRecords] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all pipeline state from backend
  const fetchAllData = useCallback(async () => {
    try {
      const [statsRes, assetsRes, modelRes, infRes, blocksRes] = await Promise.all([
        getOverviewStats(),
        listAssets(),
        getActiveModel(),
        listInferenceRecords(),
        listLedgerBlocks(),
      ]);

      setOverview(statsRes.data);
      setAssets(assetsRes.data);
      setModel(modelRes.data);
      setInferenceRecords(infRes.data);
      setBlocks(blocksRes.data);
      setAuditTrail(statsRes.data.audit_trail || []);
    } catch (err) {
      console.error('Failed to fetch pipeline data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    // Poll every 5 seconds for live status sync
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleNavigate = (view, tab = null) => {
    if (tab) {
      setActiveTab(tab);
      setTargetTabAfterLogin(tab);
    }

    // If attempting to open Command Center without authentication, redirect to Login
    if (view === 'dashboard' && !user) {
      setAuthNotice('Security clearance authentication is required before accessing the Tactical Command Center.');
      setCurrentView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setAuthNotice('');
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (userProfile) => {
    setUser(userProfile);
    try {
      localStorage.setItem('aegis_cv_user', JSON.stringify(userProfile));
    } catch (e) {
      console.error(e);
    }
    setAuthNotice('');
    setActiveTab(targetTabAfterLogin || 'data');
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('aegis_cv_user');
    } catch (e) {
      console.error(e);
    }
    setCurrentView('home');
  };

  const handleRestoreState = async () => {
    setIsRestoring(true);
    try {
      await restoreDemoState();
      await fetchAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRestoring(false);
    }
  };

  const violationsCount = overview?.metrics?.detected_violations || 0;

  const tabs = [
    { id: 'data', label: '1. DATA INTEGRITY', icon: Database },
    { id: 'model', label: '2. MODEL INTEGRITY', icon: Cpu },
    { id: 'inference', label: '3. AI INFERENCE & ATTESTATION', icon: Eye },
    { id: 'ledger', label: '4. BLOCKCHAIN AUDIT LEDGER', icon: LinkIcon },
  ];

  return (
    <div className="min-h-screen bg-tactical-900 text-slate-100 flex flex-col font-sans selection:bg-tactical-cyan selection:text-slate-950">
      
      {/* Tactical Defense Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onRestoreState={handleRestoreState}
        isRestoring={isRestoring}
        violationsCount={violationsCount}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Real-time Threat Banner if violations exist */}
        {violationsCount > 0 && (
          <div className="p-4 rounded-xl bg-tactical-red/20 border-2 border-tactical-red flex items-center justify-between text-tactical-red font-mono text-xs shadow-[0_0_20px_rgba(255,51,102,0.3)] animate-pulse">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-bold text-sm block">DEFENSE ALERT: {violationsCount} INTEGRITY VIOLATION(S) DETECTED</span>
                <span className="text-[11px] text-slate-300">
                  Unauthorized modification detected in multi-contributor supply chain. Inspect below or trigger restoration.
                </span>
              </div>
            </div>
            <button
              onClick={handleRestoreState}
              disabled={isRestoring}
              className="px-4 py-2 rounded-lg bg-tactical-red text-white font-bold hover:bg-tactical-red/80 transition-all text-xs flex-shrink-0 ml-4"
            >
              RESTORE INTEGRITY
            </button>
          </div>
        )}

        {/* View Switching */}
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            overview={overview}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            user={user}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onLogin={handleLogin}
            onLogout={handleLogout}
            currentUser={user}
            onNavigate={handleNavigate}
            authNotice={authNotice}
          />
        )}

        {currentView === 'dashboard' && user && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 4 Status Indicator Cards & Metrics */}
            <StatusOverview
              statusCards={overview?.status_cards}
              metrics={overview?.metrics}
            />

            {/* Tactical Navigation Tabs */}
            <div className="border-b border-tactical-700/60 flex items-center space-x-2 overflow-x-auto pb-1 font-mono text-xs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg transition-all border-b-2 font-bold whitespace-nowrap ${
                      isActive
                        ? 'border-tactical-cyan text-tactical-cyan bg-tactical-800/80 shadow-[0_-4px_12px_rgba(0,240,255,0.1)]'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-tactical-800/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Panels */}
            <div className="pt-2">
              {activeTab === 'data' && (
                <DataIntegrityPanel
                  assets={assets}
                  onRefresh={fetchAllData}
                />
              )}

              {activeTab === 'model' && (
                <ModelIntegrityPanel
                  model={model}
                  onRefresh={fetchAllData}
                />
              )}

              {activeTab === 'inference' && (
                <InferencePanel
                  assets={assets}
                  model={model}
                  inferenceRecords={inferenceRecords}
                  onRefresh={fetchAllData}
                />
              )}

              {activeTab === 'ledger' && (
                <AuditLedgerView
                  blocks={blocks}
                  auditTrail={auditTrail}
                  onRefresh={fetchAllData}
                />
              )}
            </div>

          </div>
        )}

      </main>

      {/* Demo Attack Simulator Modal */}
      <TamperSimulationModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onRefresh={fetchAllData}
      />

      {/* Footer */}
      <footer className="border-t border-tactical-700/40 py-4 text-center font-mono text-[11px] text-slate-500 bg-tactical-900">
        AEGIS-CV // Smart India Hackathon 2026 // Problem Statement 228 // Multi-Contributor CV Integrity Assurance
      </footer>

    </div>
  );
}
