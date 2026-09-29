import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertTriangle, RefreshCw, FileText, Hash, ShieldCheck, ShieldAlert, Copy } from 'lucide-react';
import { uploadImage, verifyAsset } from '../services/api';

import { getStorageUrl } from '../utils/imageUrl';

export default function DataIntegrityPanel({ assets, onRefresh }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage(null);
    setDuplicateWarning(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('contributor_id', 'DEFENSE-FIELD-RECON');

    try {
      const res = await uploadImage(formData);
      if (res.data.is_duplicate) {
        setDuplicateWarning(res.data.message);
      } else {
        setUploadMessage(res.data.message);
      }
      onRefresh();
    } catch (err) {
      setUploadMessage(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVerify = async (assetId) => {
    setVerifyingId(assetId);
    try {
      await verifyAsset(assetId);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upload Zone */}
      <div className="hud-card p-6 rounded-xl border border-tactical-600/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2">
              <Upload className="w-5 h-5 text-tactical-cyan" />
              <span>INGEST COMPUTER-VISION RECONNAISSANCE IMAGE</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Generates genuine cryptographic SHA-256 seal, checks for duplicates, and records block to ledger.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-tactical-cyan/20 to-tactical-600/50 hover:from-tactical-cyan/30 hover:to-tactical-600/70 border border-tactical-cyan/60 text-tactical-cyan font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)] flex items-center space-x-2 disabled:opacity-50"
            >
              <Upload className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
              <span>{isUploading ? 'CALCULATING HASH...' : 'SELECT & INGEST IMAGE'}</span>
            </button>
          </div>
        </div>

        {/* Notifications / Alerts */}
        {uploadMessage && (
          <div className="mt-4 p-3 rounded-lg bg-tactical-green/10 border border-tactical-green/40 text-tactical-green text-xs font-mono flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{uploadMessage}</span>
          </div>
        )}

        {duplicateWarning && (
          <div className="mt-4 p-3 rounded-lg bg-tactical-amber/15 border border-tactical-amber/50 text-tactical-amber text-xs font-mono flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{duplicateWarning}</span>
          </div>
        )}
      </div>

      {/* Assets Repository Table */}
      <div className="hud-card rounded-xl border border-tactical-600/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-tactical-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4 text-tactical-cyan" />
            <h4 className="text-sm font-bold text-white font-mono">
              REGISTERED RECONNAISSANCE ASSETS & CRYPTOGRAPHIC SEALS
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {assets.length} ASSETS REGISTERED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-tactical-800/80 text-slate-400 border-b border-tactical-700/50">
              <tr>
                <th className="px-5 py-3 font-semibold">PREVIEW</th>
                <th className="px-5 py-3 font-semibold">ASSET FILE & CONTRIBUTOR</th>
                <th className="px-5 py-3 font-semibold">ORIGINAL SHA-256 HASH</th>
                <th className="px-5 py-3 font-semibold">STATUS</th>
                <th className="px-5 py-3 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical-700/30">
              {assets.map((asset) => {
                const isVerified = asset.status === 'VERIFIED';
                return (
                  <tr key={asset.id} className="hover:bg-tactical-800/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="w-14 h-10 rounded border border-tactical-600/60 overflow-hidden bg-black flex items-center justify-center">
                        <img
                          src={getStorageUrl(asset.url)}
                          alt={asset.filename}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="%23555" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                          }}
                        />
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-200">{asset.filename}</div>
                      <div className="text-[10px] text-tactical-cyan mt-0.5">{asset.contributor_id || 'RECON-UNIT'}</div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-2 text-[11px] text-slate-300">
                        <span className="font-mono bg-tactical-900/80 px-2 py-0.5 rounded border border-tactical-700/60">
                          {asset.original_hash.substring(0, 16)}...{asset.original_hash.substring(asset.original_hash.length - 8)}
                        </span>
                      </div>
                      {asset.status === 'TAMPERED' && asset.current_hash && (
                        <div className="text-[10px] text-tactical-red mt-1">
                          Current: {asset.current_hash.substring(0, 16)}... (MISMATCH)
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      {isVerified ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-tactical-green/10 border border-tactical-green/40 text-tactical-green">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>VERIFIED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-tactical-red/20 border border-tactical-red text-tactical-red animate-pulse">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>TAMPERED</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleVerify(asset.id)}
                        disabled={verifyingId === asset.id}
                        className="px-3 py-1.5 rounded bg-tactical-700/60 hover:bg-tactical-600/70 border border-tactical-500/50 text-[11px] text-slate-200 transition-all flex items-center space-x-1.5 ml-auto disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 text-tactical-cyan ${verifyingId === asset.id ? 'animate-spin' : ''}`} />
                        <span>RECALCULATE & VERIFY</span>
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
