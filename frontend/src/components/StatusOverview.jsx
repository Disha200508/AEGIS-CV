import React from 'react';
import { ShieldCheck, ShieldAlert, Database, Cpu, Eye, Link, AlertTriangle } from 'lucide-react';

export default function StatusOverview({ statusCards, metrics }) {
  const indicators = [
    {
      label: 'DATA INTEGRITY',
      status: statusCards?.data_integrity || 'VERIFIED',
      verifiedText: '✓ VERIFIED',
      tamperedText: '⚠ TAMPERED',
      icon: Database,
      desc: 'Image Checksum & Duplicate Registry'
    },
    {
      label: 'MODEL INTEGRITY',
      status: statusCards?.model_integrity || 'VERIFIED',
      verifiedText: '✓ VERIFIED',
      tamperedText: '⚠ TAMPERED',
      icon: Cpu,
      desc: 'Weight Hash & Trojan Scan'
    },
    {
      label: 'INFERENCE INTEGRITY',
      status: statusCards?.inference_integrity || 'VERIFIED',
      verifiedText: '✓ VERIFIED',
      tamperedText: '⚠ TAMPERED',
      icon: Eye,
      desc: 'Cryptographic Output Attestation'
    },
    {
      label: 'BLOCKCHAIN LEDGER',
      status: statusCards?.ledger_integrity === 'VALID' ? 'VERIFIED' : 'TAMPERED',
      verifiedText: '✓ VALID',
      tamperedText: '⚠ INVALID',
      icon: Link,
      desc: 'Immutable Audit Hash Chain'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Primary 4 Status Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((ind, i) => {
          const isOk = ind.status === 'VERIFIED';
          const Icon = ind.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-xl transition-all duration-300 hud-card ${
                isOk ? 'hud-card-verified' : 'hud-card-tampered'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isOk ? 'bg-tactical-green/10 text-tactical-green' : 'bg-tactical-red/20 text-tactical-red'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold tracking-wider text-slate-300">
                    {ind.label}
                  </span>
                </div>
                {isOk ? (
                  <ShieldCheck className="w-5 h-5 text-tactical-green" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-tactical-red animate-bounce" />
                )}
              </div>

              <div className="flex items-baseline justify-between">
                <div
                  className={`text-xl font-mono font-black tracking-tight ${
                    isOk ? 'text-tactical-green glow-green' : 'text-tactical-red glow-red'
                  }`}
                >
                  {isOk ? ind.verifiedText : ind.tamperedText}
                </div>
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOk ? 'bg-tactical-green shadow-[0_0_8px_#00ff88]' : 'bg-tactical-red shadow-[0_0_8px_#ff3366]'
                  }`}
                />
              </div>

              <p className="mt-2 text-[11px] text-slate-400 font-mono tracking-tight">
                {ind.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-lg bg-tactical-800/60 border border-tactical-600/40 font-mono">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Total Assets</span>
          <span className="text-2xl font-bold text-white mt-1 block">{metrics?.total_assets || 0}</span>
        </div>

        <div className="p-3.5 rounded-lg bg-tactical-800/60 border border-tactical-600/40 font-mono">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Verified Assets</span>
          <span className="text-2xl font-bold text-tactical-green mt-1 block">{metrics?.verified_assets || 0}</span>
        </div>

        <div className="p-3.5 rounded-lg bg-tactical-800/60 border border-tactical-600/40 font-mono">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Detected Violations</span>
          <span className={`text-2xl font-bold mt-1 block ${
            (metrics?.detected_violations || 0) > 0 ? 'text-tactical-red animate-pulse' : 'text-slate-300'
          }`}>
            {metrics?.detected_violations || 0}
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-tactical-800/60 border border-tactical-600/40 font-mono">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Inference Count</span>
          <span className="text-2xl font-bold text-tactical-cyan mt-1 block">{metrics?.total_inferences || 0}</span>
        </div>

        <div className="p-3.5 rounded-lg bg-tactical-800/60 border border-tactical-600/40 font-mono col-span-2 md:col-span-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Ledger Blocks</span>
          <span className="text-2xl font-bold text-tactical-amber mt-1 block">{metrics?.total_blocks || 0}</span>
        </div>
      </div>
    </div>
  );
}
