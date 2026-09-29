import React, { useState } from 'react';
import { Link, ShieldCheck, ShieldAlert, RefreshCw, FileText, CheckCircle2, ChevronRight, Clock, Hash, AlertTriangle } from 'lucide-react';
import { verifyLedgerChain } from '../services/api';

export default function AuditLedgerView({ blocks, auditTrail, onRefresh }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerifyLedger = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const res = await verifyLedgerChain();
      setVerificationResult(res.data);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tactical-green/10 text-tactical-green border border-tactical-green/30">SUCCESS</span>;
      case 'TAMPER_DETECTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tactical-red/20 text-tactical-red border border-tactical-red animate-pulse">TAMPER DETECTED</span>;
      case 'ALERT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tactical-red/20 text-tactical-red border border-tactical-red">ALERT</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tactical-amber/20 text-tactical-amber border border-tactical-amber/40">WARNING</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tactical-700 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Blockchain Header & Verification Action */}
      <div className="hud-card p-6 rounded-xl border border-tactical-600/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2">
              <Link className="w-5 h-5 text-tactical-cyan" />
              <span>IMMUTABLE APPEND-ONLY BLOCKCHAIN AUDIT LEDGER</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Every integrity event is cryptographically linked with previous_hash and current block_hash.
            </p>
          </div>

          <button
            onClick={handleVerifyLedger}
            disabled={isVerifying}
            className="px-5 py-2.5 rounded-lg bg-tactical-700 hover:bg-tactical-600 border border-tactical-cyan text-xs font-mono font-bold text-tactical-cyan transition-all flex items-center space-x-2 shadow-[0_0_12px_rgba(0,240,255,0.15)] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'VERIFYING CHAIN...' : 'VERIFY BLOCKCHAIN INTEGRITY'}</span>
          </button>
        </div>

        {/* Verification Result Banner */}
        {verificationResult && (
          <div className={`mt-4 p-4 rounded-lg font-mono text-xs flex items-start space-x-3 ${
            verificationResult.is_valid
              ? 'bg-tactical-green/10 border border-tactical-green/40 text-tactical-green'
              : 'bg-tactical-red/20 border border-tactical-red text-tactical-red animate-pulse'
          }`}>
            {verificationResult.is_valid ? (
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">
                {verificationResult.is_valid ? 'LEDGER INTEGRITY MATHEMATICALLY VERIFIED' : 'LEDGER CORRUPTION DETECTED'}
              </span>
              <span className="mt-0.5 block">
                {verificationResult.message || verificationResult.error}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Blockchain Chain Visualizer (Horizontal Scroll of Blocks) */}
      <div className="hud-card p-6 rounded-xl border border-tactical-600/50">
        <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Hash className="w-4 h-4 text-tactical-amber" />
          <span>CRYPTOGRAPHIC BLOCK CHAIN SEQUENCE (LATEST FIRST)</span>
        </h4>

        <div className="flex space-x-4 overflow-x-auto pb-4 pt-1 font-mono text-xs scrollbar-thin">
          {blocks.map((block, idx) => (
            <div
              key={block.block_index}
              className="flex-shrink-0 w-72 p-4 rounded-lg bg-tactical-800/90 border border-tactical-600/70 hover:border-tactical-cyan transition-all space-y-2 relative"
            >
              {/* Block Header */}
              <div className="flex items-center justify-between border-b border-tactical-700/60 pb-2">
                <span className="text-tactical-cyan font-bold">
                  BLOCK #{block.block_index}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-tactical-900 border border-tactical-700 text-tactical-green font-semibold">
                  {block.event_type}
                </span>
              </div>

              {/* Hashes */}
              <div className="space-y-1 text-[10px]">
                <div className="text-slate-400">
                  <span className="text-slate-500">PREV HASH:</span>{' '}
                  <span className="text-slate-300 font-mono">
                    {block.previous_hash.substring(0, 14)}...
                  </span>
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-500">BLOCK HASH:</span>{' '}
                  <span className="text-tactical-cyan font-mono font-bold">
                    {block.block_hash.substring(0, 14)}...
                  </span>
                </div>
                <div className="text-slate-500 text-[9px] pt-1">
                  {block.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Audit Trail Table */}
      <div className="hud-card rounded-xl border border-tactical-600/50 overflow-hidden font-mono text-xs">
        <div className="px-6 py-4 border-b border-tactical-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-tactical-cyan" />
            <h4 className="font-bold text-white uppercase tracking-wider">
              REAL-TIME AUDIT TRAIL LOGS
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            {auditTrail.length} RECORDED EVENTS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-tactical-800/80 text-slate-400 border-b border-tactical-700/50">
              <tr>
                <th className="px-4 py-3">TIMESTAMP</th>
                <th className="px-4 py-3">EVENT</th>
                <th className="px-4 py-3">COMPONENT</th>
                <th className="px-4 py-3">ASSET</th>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3">CRYPTOGRAPHIC HASH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical-700/30">
              {auditTrail.map((log) => (
                <tr key={log.id} className="hover:bg-tactical-800/40 transition-colors">
                  <td className="px-4 py-2.5 text-slate-400 text-[11px]">
                    {log.timestamp ? log.timestamp.replace('T', ' ').substring(0, 19) : ''}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-white">
                    {log.event}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-tactical-900 border border-tactical-700 text-tactical-cyan">
                      {log.component}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">
                    {log.asset}
                  </td>
                  <td className="px-4 py-2.5">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="px-4 py-2.5 text-[11px] text-slate-400">
                    {log.hash ? (
                      <span className="bg-tactical-900 px-2 py-0.5 rounded border border-tactical-700 font-mono text-slate-300">
                        {log.hash.substring(0, 12)}...{log.hash.substring(log.hash.length - 6)}
                      </span>
                    ) : (
                      '--'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
