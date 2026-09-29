import React, { useState } from 'react';
import { Cpu, ShieldCheck, ShieldAlert, RefreshCw, Key, CheckCircle, Lock, AlertOctagon } from 'lucide-react';
import { verifyModel } from '../services/api';

export default function ModelIntegrityPanel({ model, onRefresh }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState(null);

  const handleVerifyModel = async () => {
    setIsVerifying(true);
    setVerifyMessage(null);
    try {
      const res = await verifyModel();
      setVerifyMessage(res.data.message);
      onRefresh();
    } catch (err) {
      setVerifyMessage(err.response?.data?.detail || 'Model verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const isVerified = model?.status === 'VERIFIED';

  return (
    <div className="space-y-6">
      
      {/* Model Spec Card */}
      <div className={`p-6 rounded-xl hud-card ${isVerified ? 'hud-card-verified' : 'hud-card-tampered'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl ${isVerified ? 'bg-tactical-green/10 text-tactical-green' : 'bg-tactical-red/20 text-tactical-red'}`}>
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-bold text-white font-mono">
                  {model?.model_name || 'YOLOv8n-Tactical-Recon'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-tactical-cyan/10 border border-tactical-cyan/40 text-tactical-cyan">
                  {model?.version || 'v1.0.0'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-tactical-700 text-slate-300">
                  {model?.model_type || 'YOLOv8n'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Official Defense Certified Neural Weights // Authority: {model?.registered_by || 'DEFENSE-RESEARCH-LAB'}
              </p>
            </div>
          </div>

          <button
            onClick={handleVerifyModel}
            disabled={isVerifying}
            className="px-5 py-2.5 rounded-lg bg-tactical-700 hover:bg-tactical-600 border border-tactical-500 text-xs font-mono font-bold text-white transition-all flex items-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-tactical-cyan ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'SCANNING WEIGHTS...' : 'VERIFY WEIGHT CHECKSUM'}</span>
          </button>
        </div>

        {/* Verification Message Alert */}
        {verifyMessage && (
          <div className={`mt-4 p-3 rounded-lg text-xs font-mono flex items-center space-x-2 ${
            isVerified ? 'bg-tactical-green/10 border border-tactical-green/40 text-tactical-green' : 'bg-tactical-red/20 border border-tactical-red text-tactical-red'
          }`}>
            {isVerified ? <ShieldCheck className="w-4 h-4 flex-shrink-0" /> : <ShieldAlert className="w-4 h-4 flex-shrink-0" />}
            <span>{verifyMessage}</span>
          </div>
        )}

        {/* Cryptographic Signature Box */}
        <div className="mt-6 pt-6 border-t border-tactical-700/60 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 rounded-lg bg-tactical-900/80 border border-tactical-700/50">
            <span className="text-slate-400 text-[11px] block">REGISTERED MASTER SHA-256</span>
            <span className="text-tactical-cyan font-bold break-all mt-1 block">
              {model?.original_hash || 'CALCULATING...'}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-tactical-900/80 border border-tactical-700/50">
            <span className="text-slate-400 text-[11px] block">LIVE WEIGHTS CHECKSUM</span>
            <span className={`font-bold break-all mt-1 block ${isVerified ? 'text-tactical-green' : 'text-tactical-red'}`}>
              {model?.current_hash || model?.original_hash}
            </span>
          </div>
        </div>
      </div>

      {/* Supply Chain Security Safeguards Checklist */}
      <div className="hud-card p-6 rounded-xl border border-tactical-600/50 font-mono text-xs">
        <h4 className="font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Lock className="w-4 h-4 text-tactical-green" />
          <span>MULTI-CONTRIBUTOR MODEL INTEGRITY CONTROLS</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg bg-tactical-800/60 border border-tactical-700/50">
            <div className="flex items-center space-x-2 text-tactical-green font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>WEIGHT HASH ATTESTATION</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Every checkpoint is cryptographically sealed before edge deployment.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-tactical-800/60 border border-tactical-700/50">
            <div className="flex items-center space-x-2 text-tactical-green font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>PRE-INFERENCE GUARD</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Inference engine halts instantly if model weight mismatch or substitution is detected.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-tactical-800/60 border border-tactical-700/50">
            <div className="flex items-center space-x-2 text-tactical-green font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>TROJAN / BACKDOOR AUDIT</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Blocks unauthorized weights alterations and supply-chain poisoning.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
