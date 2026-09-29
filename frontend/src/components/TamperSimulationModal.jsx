import React, { useState } from 'react';
import { X, Zap, AlertTriangle, ShieldCheck, RefreshCw, FileWarning, Cpu, Eye, CheckCircle2 } from 'lucide-react';
import { simulateDatasetTamper, simulateModelTamper, simulateInferenceTamper, restoreDemoState } from '../services/api';

export default function TamperSimulationModal({ isOpen, onClose, onRefresh }) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleAction = async (actionType, apiCall) => {
    setLoadingAction(actionType);
    setFeedback(null);
    try {
      const res = await apiCall();
      setFeedback({
        type: res.data.success ? 'success' : 'error',
        message: res.data.message || res.data.error
      });
      onRefresh();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Operation failed.'
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-tactical-900 border-2 border-tactical-amber rounded-2xl max-w-2xl w-full p-6 shadow-[0_0_30px_rgba(255,170,0,0.25)] relative font-mono">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-lg bg-tactical-amber/20 text-tactical-amber border border-tactical-amber/50">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              DEMO-ONLY ADVERSARY ATTACK SIMULATOR
            </h3>
            <span className="text-[11px] text-tactical-amber font-semibold">
              CONTROLLED ENVIRONMENT // SAFE DEMO DUPLICATES
            </span>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="p-3 my-4 rounded-lg bg-tactical-amber/10 border border-tactical-amber/40 text-tactical-amber text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            SAFETY PROTOCOL: The simulator modifies only safe demo copies/records. Master originals remain pristine and can be restored at any time.
          </span>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-3 mb-4 rounded-lg text-xs flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-tactical-green/10 border border-tactical-green/40 text-tactical-green'
              : 'bg-tactical-red/20 border border-tactical-red text-tactical-red'
          }`}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-5">
          {/* Attack 1: Dataset */}
          <div className="p-4 rounded-xl bg-tactical-800/80 border border-tactical-700 hover:border-tactical-red transition-all space-y-3">
            <div className="flex items-center space-x-2 text-tactical-red font-bold text-xs">
              <FileWarning className="w-4 h-4" />
              <span>DATASET ATTACK</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Alters bytes of an aerial recon image to simulate data poisoning or metadata corruption.
            </p>
            <button
              onClick={() => handleAction('DATASET', simulateDatasetTamper)}
              disabled={loadingAction !== null}
              className="w-full py-2 rounded bg-tactical-red/20 hover:bg-tactical-red/30 border border-tactical-red text-tactical-red text-xs font-bold transition-all disabled:opacity-50"
            >
              {loadingAction === 'DATASET' ? 'TAMPERING...' : 'TAMPER DATASET'}
            </button>
          </div>

          {/* Attack 2: Model */}
          <div className="p-4 rounded-xl bg-tactical-800/80 border border-tactical-700 hover:border-tactical-red transition-all space-y-3">
            <div className="flex items-center space-x-2 text-tactical-red font-bold text-xs">
              <Cpu className="w-4 h-4" />
              <span>MODEL ATTACK</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Injects Trojan bytes into demo model weights, triggering pre-inference checksum halt.
            </p>
            <button
              onClick={() => handleAction('MODEL', simulateModelTamper)}
              disabled={loadingAction !== null}
              className="w-full py-2 rounded bg-tactical-red/20 hover:bg-tactical-red/30 border border-tactical-red text-tactical-red text-xs font-bold transition-all disabled:opacity-50"
            >
              {loadingAction === 'MODEL' ? 'TAMPERING...' : 'TAMPER MODEL'}
            </button>
          </div>

          {/* Attack 3: Inference */}
          <div className="p-4 rounded-xl bg-tactical-800/80 border border-tactical-700 hover:border-tactical-red transition-all space-y-3">
            <div className="flex items-center space-x-2 text-tactical-red font-bold text-xs">
              <Eye className="w-4 h-4" />
              <span>OUTPUT ATTACK</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Alters target counts and bounding boxes in saved record, breaking the attestation seal.
            </p>
            <button
              onClick={() => handleAction('INFERENCE', simulateInferenceTamper)}
              disabled={loadingAction !== null}
              className="w-full py-2 rounded bg-tactical-red/20 hover:bg-tactical-red/30 border border-tactical-red text-tactical-red text-xs font-bold transition-all disabled:opacity-50"
            >
              {loadingAction === 'INFERENCE' ? 'TAMPERING...' : 'TAMPER INFERENCE'}
            </button>
          </div>
        </div>

        {/* 1-Click Restoration Action */}
        <div className="pt-4 border-t border-tactical-700/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Reset all pipelines back to verified state:
          </span>
          <button
            onClick={() => handleAction('RESTORE', restoreDemoState)}
            disabled={loadingAction !== null}
            className="px-5 py-2.5 rounded-lg bg-tactical-green/20 hover:bg-tactical-green/30 border border-tactical-green text-tactical-green text-xs font-bold transition-all flex items-center space-x-2 disabled:opacity-50 shadow-[0_0_12px_rgba(0,255,136,0.15)]"
          >
            <RefreshCw className={`w-4 h-4 ${loadingAction === 'RESTORE' ? 'animate-spin' : ''}`} />
            <span>RESTORE DEMO STATE (1-CLICK)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
