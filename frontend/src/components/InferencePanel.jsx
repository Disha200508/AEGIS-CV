import React, { useState } from 'react';
import { Eye, ShieldCheck, ShieldAlert, Play, CheckCircle2, AlertOctagon, Hash, Target, RefreshCw } from 'lucide-react';
import { runInference, verifyInferenceRecord } from '../services/api';
import { getStorageUrl } from '../utils/imageUrl';

export default function InferencePanel({ assets, model, inferenceRecords, onRefresh }) {
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [verifyingRecordId, setVerifyingRecordId] = useState(null);
  const [verifyStatusMessage, setVerifyStatusMessage] = useState(null);

  // If no asset selected yet and assets exist, set first
  React.useEffect(() => {
    if (!selectedAssetId && assets.length > 0) {
      setSelectedAssetId(assets[0].id);
    }
  }, [assets, selectedAssetId]);

  const selectedAsset = assets.find((a) => a.id === Number(selectedAssetId));

  const handleRunInference = async () => {
    if (!selectedAssetId) return;
    setIsRunning(true);
    setErrorMessage(null);
    setVerifyStatusMessage(null);

    try {
      const res = await runInference(selectedAssetId);
      setCurrentResult(res.data);
      onRefresh();
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Inference execution failed.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleVerifyInference = async (recordId) => {
    setVerifyingRecordId(recordId);
    setVerifyStatusMessage(null);
    try {
      const res = await verifyInferenceRecord(recordId);
      setVerifyStatusMessage(res.data.message);
      onRefresh();
    } catch (err) {
      setVerifyStatusMessage(err.response?.data?.detail || 'Verification failed.');
    } finally {
      setVerifyingRecordId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Controls & Pre-flight Header */}
      <div className="hud-card p-6 rounded-xl border border-tactical-600/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2">
              <Eye className="w-5 h-5 text-tactical-cyan" />
              <span>CRYPTOGRAPHICALLY ATTESTED COMPUTER-VISION INFERENCE</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Enforces pre-flight data & model integrity verification. Generates a signed SHA-256 attestation seal binding inputs, weights, and detections.
            </p>
          </div>

          {/* Asset Picker & Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedAssetId || ''}
              onChange={(e) => setSelectedAssetId(Number(e.target.value))}
              className="bg-tactical-900 border border-tactical-600/80 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-tactical-cyan"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.filename} [{a.status}]
                </option>
              ))}
            </select>

            <button
              onClick={handleRunInference}
              disabled={isRunning || !selectedAssetId}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-tactical-cyan/30 to-tactical-green/30 hover:from-tactical-cyan/40 hover:to-tactical-green/40 border border-tactical-cyan text-xs font-mono font-bold text-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] flex items-center space-x-2 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 text-tactical-green ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'RUNNING YOLO INFERENCE...' : 'EXECUTE AI INFERENCE'}</span>
            </button>
          </div>
        </div>

        {/* Security Alert if blocked */}
        {errorMessage && (
          <div className="mt-4 p-4 rounded-lg bg-tactical-red/20 border border-tactical-red text-tactical-red text-xs font-mono flex items-start space-x-3">
            <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="font-bold block">INTEGRITY GUARD ENFORCEMENT: EXECUTION HALTED</span>
              <span className="mt-0.5 block">{errorMessage}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Results View (Live Output or Active Record) */}
      {currentResult && (
        <div className="hud-card p-6 rounded-xl border border-tactical-cyan/40 space-y-6">
          <div className="flex items-center justify-between border-b border-tactical-700/60 pb-4">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 rounded bg-tactical-green/10 border border-tactical-green/40 text-tactical-green text-xs font-mono font-bold">
                ✓ INFERENCE ATTESTED & CERTIFIED
              </span>
              <span className="text-xs font-mono text-slate-300">
                {currentResult.detected_count} Targets Localized
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {currentResult.executed_at}
            </span>
          </div>

          {/* Visual Display: Side-by-side or Main Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 block mb-2">
                ORIGINAL RECON INPUT IMAGE
              </span>
              <div className="rounded-lg overflow-hidden border border-tactical-700 bg-black aspect-video flex items-center justify-center">
                <img
                  src={getStorageUrl(selectedAsset?.url)}
                  alt="Original Recon"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-tactical-cyan block mb-2 flex items-center justify-between">
                <span>TACTICAL HUD ANNOTATED OUTPUT</span>
                <span className="text-[10px] text-tactical-green">CRYPTOGRAPHICALLY BOUND</span>
              </span>
              <div className="rounded-lg overflow-hidden border border-tactical-cyan/60 bg-black aspect-video flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                <img
                  src={getStorageUrl(currentResult.output_image_url)}
                  alt="Annotated Recon"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Target List & Cryptographic Seal Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
            {/* Detected Targets */}
            <div className="p-4 rounded-lg bg-tactical-900/80 border border-tactical-700/50 space-y-2">
              <span className="text-slate-400 font-bold block mb-2 flex items-center space-x-1.5">
                <Target className="w-4 h-4 text-tactical-green" />
                <span>LOCALIZED TACTICAL OBJECTS</span>
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {currentResult.detections.map((det, idx) => (
                  <div key={idx} className="p-2 rounded bg-tactical-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-tactical-cyan font-bold">{det.target_id}</span>
                      <span className="text-white font-medium">{det.label}</span>
                    </div>
                    <span className="text-tactical-green font-bold">
                      {Math.round(det.confidence * 100)}% CONF
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Seal */}
            <div className="p-4 rounded-lg bg-tactical-900/80 border border-tactical-700/50 space-y-2">
              <span className="text-slate-400 font-bold block flex items-center space-x-1.5">
                <Hash className="w-4 h-4 text-tactical-cyan" />
                <span>CRYPTOGRAPHIC INFERENCE ATTESTATION SEAL</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Mathematical binding of Input Image Hash + Model Checksum + Object Telemetry + Timestamp.
              </p>
              <div className="p-2.5 rounded bg-tactical-800 border border-tactical-600/60 break-all text-tactical-cyan font-bold text-[11px]">
                {currentResult.record_hash}
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                SEAL REGISTERED IN BLOCKCHAIN AUDIT LEDGER // NON-REPUDIABLE
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Inference Records & Verification Section */}
      <div className="hud-card rounded-xl border border-tactical-600/50 overflow-hidden font-mono text-xs">
        <div className="px-6 py-4 border-b border-tactical-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-tactical-green" />
            <h4 className="font-bold text-white uppercase tracking-wider">
              INFERENCE OUTPUT INTEGRITY & ATTESTATION LOGS
            </h4>
          </div>
          {verifyStatusMessage && (
            <span className="text-tactical-cyan text-xs font-bold">
              {verifyStatusMessage}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-tactical-800/80 text-slate-400 border-b border-tactical-700/50">
              <tr>
                <th className="px-5 py-3">RECORD ID</th>
                <th className="px-5 py-3">ASSET</th>
                <th className="px-5 py-3">TARGETS</th>
                <th className="px-5 py-3">SEALED ATTESTATION HASH</th>
                <th className="px-5 py-3">INTEGRITY</th>
                <th className="px-5 py-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical-700/30">
              {inferenceRecords.map((rec) => {
                const isRecVerified = rec.status === 'VERIFIED';
                return (
                  <tr key={rec.id} className="hover:bg-tactical-800/40 transition-colors">
                    <td className="px-5 py-3 text-tactical-cyan font-bold">
                      #INFER-{rec.id}
                    </td>
                    <td className="px-5 py-3 text-white">
                      {rec.asset_filename}
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      {rec.detected_count} targets
                    </td>
                    <td className="px-5 py-3 text-[11px] text-slate-300">
                      <span className="bg-tactical-900/80 px-2 py-0.5 rounded border border-tactical-700">
                        {rec.record_hash?.substring(0, 16)}...
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {isRecVerified ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-tactical-green/10 border border-tactical-green/40 text-tactical-green">
                          <ShieldCheck className="w-3 h-3" />
                          <span>VERIFIED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-tactical-red/20 border border-tactical-red text-tactical-red animate-pulse">
                          <ShieldAlert className="w-3 h-3" />
                          <span>TAMPERED</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleVerifyInference(rec.id)}
                        disabled={verifyingRecordId === rec.id}
                        className="px-3 py-1 rounded bg-tactical-700/60 hover:bg-tactical-600/70 border border-tactical-500/50 text-[11px] text-slate-200 transition-all flex items-center space-x-1.5 ml-auto disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 text-tactical-cyan ${verifyingRecordId === rec.id ? 'animate-spin' : ''}`} />
                        <span>VERIFY SEAL</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
