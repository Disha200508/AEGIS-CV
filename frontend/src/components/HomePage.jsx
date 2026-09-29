import React from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Database, 
  Cpu, 
  Eye, 
  Link as LinkIcon, 
  Zap, 
  Lock, 
  Terminal, 
  Radio, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Layers, 
  Crosshair, 
  Server,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

export default function HomePage({ 
  onNavigate, 
  overview, 
  onOpenSimulator, 
  user 
}) {
  const metrics = overview?.metrics || {
    total_assets: 3,
    active_models: 1,
    total_inferences: 3,
    total_blocks: 7,
    verified_assets: 3,
    detected_violations: 0
  };

  const pillars = [
    {
      id: 'data',
      title: '1. Recon Data Integrity',
      icon: Database,
      tag: 'SHA-256 SEALS & DEDUPLICATION',
      color: 'tactical-cyan',
      borderColor: 'border-tactical-cyan/40',
      bgColor: 'bg-tactical-cyan/5',
      description: 'Zero-trust imagery ingestion. Recalculates genuine SHA-256 byte hashes upon ingest, instantly blocks covert pixel tampering, and detects duplicate re-uploads.',
      capabilities: [
        'Deterministic SHA-256 Image Hashing',
        'Instant Duplicate Checksum Detection',
        'Byte-Level Pixel Modification Alerting'
      ],
      tabId: 'data'
    },
    {
      id: 'model',
      title: '2. Model Supply-Chain Guard',
      icon: Cpu,
      tag: 'CHECKPOINT VERIFICATION',
      color: 'tactical-green',
      borderColor: 'border-tactical-green/40',
      bgColor: 'bg-tactical-green/5',
      description: 'Validates YOLOv8 tactical weights before execution. Enforces strict cryptographic pre-flight quarantine against Trojan injections and unauthorized checkpoint substitution.',
      capabilities: [
        'Registered Model Weights Hash Matching',
        'Pre-Flight Inference Gatekeeper',
        'Supply-Chain Backdoor Prevention'
      ],
      tabId: 'model'
    },
    {
      id: 'inference',
      title: '3. Cryptographic Inference Seal',
      icon: Eye,
      tag: 'ATTESTATION BINDING',
      color: 'tactical-amber',
      borderColor: 'border-tactical-amber/40',
      bgColor: 'bg-tactical-amber/5',
      description: 'Generates non-repudiable mathematical Attestation Seals binding Input Image + Model Weight + Bounding Boxes + Timestamp into a single verifiable cryptographic signature.',
      capabilities: [
        'H(Image || Model || Detections || Time)',
        'Tactical HUD Visual Telemetry Render',
        'Mathematical Output Non-Repudiation'
      ],
      tabId: 'inference'
    },
    {
      id: 'ledger',
      title: '4. Immutable Blockchain Ledger',
      icon: LinkIcon,
      tag: 'APPEND-ONLY MERKLE CHAIN',
      color: 'purple-400',
      borderColor: 'border-purple-500/40',
      bgColor: 'bg-purple-500/5',
      description: 'Lightweight append-only blockchain linking every ingest, model registration, inference run, and tamper alert. Mathematically guarantees continuous audit trail integrity.',
      capabilities: [
        'Cryptographic Previous Hash Linkage',
        'Real-time Chain Continuity Audits',
        'Permanent Forensic Activity Logging'
      ],
      tabId: 'ledger'
    }
  ];

  const threatMatrix = [
    {
      threat: 'Data Poisoning / Pixel Tampering',
      vulnerability: 'Covert adversary modifications to reconnaissance imagery',
      defense: 'Automated SHA-256 byte-level recalculation upon ingest and pre-inference',
      status: 'MITIGATED'
    },
    {
      threat: 'Model Trojan / Backdoor Checkpoint',
      vulnerability: 'Compromised weights injected by external lab or supplier',
      defense: 'Pre-flight model checksum guard halts inference if hash diverges',
      status: 'MITIGATED'
    },
    {
      threat: 'Inference Telemetry Alteration',
      vulnerability: 'Man-in-the-middle forging target counts or coordinates',
      defense: 'Cryptographic Attestation Seal mathematically binds detection payload',
      status: 'MITIGATED'
    },
    {
      threat: 'Audit Log Erasure / Spoofing',
      vulnerability: 'Adversary clears server logs after malicious infiltration',
      defense: 'Append-only blockchain ledger where any block modification breaks chain',
      status: 'MITIGATED'
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-tactical-600/60 bg-gradient-to-b from-tactical-800/90 via-tactical-900/90 to-tactical-900 p-8 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Background Grid & Radar Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e3250_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-tactical-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-tactical-green/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          
          {/* Tag Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-tactical-cyan/10 border border-tactical-cyan/50 text-tactical-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              <Shield className="w-3.5 h-3.5" />
              <span>DEFENSE INTEGRITY ASSURANCE</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-mono text-slate-300 bg-tactical-800 border border-tactical-600">
              <Radio className="w-3.5 h-3.5 text-tactical-green animate-pulse" />
              <span>ZERO-TRUST PIPELINE // MIL-SPEC</span>
            </span>
            {user && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-tactical-green/10 border border-tactical-green/50 text-tactical-green">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OPERATOR: {user.callsign} ({user.clearance})</span>
              </span>
            )}
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-mono leading-tight">
              VisionTrace <span className="text-tactical-cyan">//</span> TRUSTED CV PIPELINE ASSURANCE
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-sans max-w-3xl leading-relaxed">
              End-to-end cryptographic chain of custody for defense reconnaissance computer vision. 
              Mathematically sealing <strong className="text-tactical-cyan">Data Ingestion</strong>, <strong className="text-tactical-green">Model Checkpoints</strong>, and <strong className="text-tactical-amber">Inference Telemetry</strong> into an <strong className="text-purple-400">Immutable Blockchain Ledger</strong>.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-tactical-800/80 border border-tactical-700/60 font-mono">
              <div className="text-[11px] text-slate-400">DATASETS SEALED</div>
              <div className="text-xl font-bold text-tactical-cyan">{metrics.total_assets} ASSETS</div>
            </div>
            <div className="p-3 rounded-lg bg-tactical-800/80 border border-tactical-700/60 font-mono">
              <div className="text-[11px] text-slate-400">MODELS GUARDED</div>
              <div className="text-xl font-bold text-tactical-green">{metrics.active_models} VERIFIED</div>
            </div>
            <div className="p-3 rounded-lg bg-tactical-800/80 border border-tactical-700/60 font-mono">
              <div className="text-[11px] text-slate-400">ATTESTED INFERENCES</div>
              <div className="text-xl font-bold text-tactical-amber">{metrics.total_inferences} SEALS</div>
            </div>
            <div className="p-3 rounded-lg bg-tactical-800/80 border border-tactical-700/60 font-mono">
              <div className="text-[11px] text-slate-400">LEDGER BLOCKS</div>
              <div className="text-xl font-bold text-purple-400">{metrics.total_blocks} BLOCKS</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-tactical-cyan to-blue-600 hover:from-tactical-cyan/90 hover:to-blue-500 text-slate-950 font-mono font-bold text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all transform hover:-translate-y-0.5"
            >
              <Crosshair className="w-4 h-4" />
              <span>LAUNCH COMMAND CENTER</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-lg bg-tactical-800 hover:bg-tactical-700 border border-tactical-amber/60 text-tactical-amber font-mono font-bold text-sm transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>ATTACK SIMULATOR (DEMO)</span>
            </button>

            {!user ? (
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-lg bg-tactical-800/60 hover:bg-tactical-700/60 border border-tactical-600 text-slate-200 font-mono text-sm transition-all"
              >
                <Lock className="w-4 h-4 text-tactical-cyan" />
                <span>OPERATOR LOGIN</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-lg bg-tactical-800/60 hover:bg-tactical-700/60 border border-tactical-green/40 text-slate-200 font-mono text-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-tactical-green" />
                <span>SECURITY CLEARANCE</span>
              </button>
            )}
          </div>

        </div>
      </section>

      {/* 4 Pillars of Integrity Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-tactical-700/60 pb-3">
          <div>
            <div className="text-xs font-mono text-tactical-cyan tracking-widest uppercase">
              DEFENSE ARCHITECTURE
            </div>
            <h2 className="text-2xl font-bold font-mono text-white">
              The 4 Pillars of Integrity Assurance
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Cryptographic guarantees across every tier of the multi-contributor CV lifecycle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className={`p-6 rounded-xl border ${pillar.borderColor} ${pillar.bgColor} bg-tactical-800/40 backdrop-blur-sm space-y-4 hover:border-slate-400/50 transition-all flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-tactical-800 border border-tactical-600 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold font-mono text-white">{pillar.title}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-900/80 border border-slate-700 text-slate-300">
                          {pillar.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    {pillar.description}
                  </p>

                  <div className="space-y-1.5 pt-2 font-mono text-xs text-slate-400">
                    {pillar.capabilities.map((cap, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-tactical-green flex-shrink-0" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-tactical-700/40">
                  <button
                    onClick={() => onNavigate('dashboard', pillar.tabId)}
                    className="w-full py-2 px-3 rounded bg-tactical-800 hover:bg-tactical-700 border border-tactical-600/80 text-xs font-mono font-bold text-slate-200 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <span>OPEN {pillar.title.toUpperCase()}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Threat Mitigation Matrix */}
      <section className="space-y-4">
        <div className="border-b border-tactical-700/60 pb-3">
          <div className="text-xs font-mono text-tactical-amber tracking-widest uppercase">
            SECURITY MATRIX
          </div>
          <h2 className="text-2xl font-bold font-mono text-white">
            Adversary Threat Vectors Addressed
          </h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-tactical-700/60 bg-tactical-800/60">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-tactical-900/90 text-slate-400 border-b border-tactical-700/60 uppercase">
              <tr>
                <th className="p-3.5">Threat Vector</th>
                <th className="p-3.5">Vulnerability Description</th>
                <th className="p-3.5">VisionTrace Cryptographic Mitigation</th>
                <th className="p-3.5 text-right">Defense Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical-700/40 text-slate-300">
              {threatMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-tactical-800/90 transition-colors">
                  <td className="p-3.5 font-bold text-tactical-cyan">{item.threat}</td>
                  <td className="p-3.5 text-slate-300 font-sans">{item.vulnerability}</td>
                  <td className="p-3.5 text-slate-200">{item.defense}</td>
                  <td className="p-3.5 text-right">
                    <span className="px-2 py-0.5 rounded bg-tactical-green/10 border border-tactical-green/40 text-tactical-green font-bold">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Multi-Contributor Pipeline Flow */}
      <section className="p-6 sm:p-8 rounded-xl border border-tactical-700/60 bg-tactical-800/40 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono text-tactical-cyan uppercase tracking-wider">
            END-TO-END CRYPTOGRAPHIC PIPELINE
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-mono text-white">
            How VisionTrace Enforces Mathematical Custody
          </h3>
          <p className="text-xs font-mono text-slate-400">
            From multi-contributor field ingestion to verified defense mission command
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center font-mono">
          <div className="p-4 rounded-lg bg-tactical-900/80 border border-tactical-700/70 space-y-2">
            <div className="w-8 h-8 rounded-full bg-tactical-cyan/20 text-tactical-cyan font-bold mx-auto flex items-center justify-center text-xs">
              01
            </div>
            <div className="font-bold text-white text-xs">FIELD INGESTION</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Distributed UAVs and recon units upload sensor imagery. SHA-256 seal is generated immediately.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-tactical-900/80 border border-tactical-700/70 space-y-2">
            <div className="w-8 h-8 rounded-full bg-tactical-green/20 text-tactical-green font-bold mx-auto flex items-center justify-center text-xs">
              02
            </div>
            <div className="font-bold text-white text-xs">SUPPLY-CHAIN AUDIT</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Neural network checkpoints are evaluated against certified SHA-256 weight checksums.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-tactical-900/80 border border-tactical-700/70 space-y-2">
            <div className="w-8 h-8 rounded-full bg-tactical-amber/20 text-tactical-amber font-bold mx-auto flex items-center justify-center text-xs">
              03
            </div>
            <div className="font-bold text-white text-xs">ATTESTED INFERENCE</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Target telemetry is computed and sealed into an immutable mathematical attestation payload.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-tactical-900/80 border border-tactical-700/70 space-y-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold mx-auto flex items-center justify-center text-xs">
              04
            </div>
            <div className="font-bold text-white text-xs">BLOCKCHAIN ANCHOR</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Every operation is sealed into an append-only ledger block linked via cryptographic hashes.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-tactical-cyan text-slate-950 font-mono font-bold text-xs hover:bg-tactical-cyan/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            <span>PROCEED TO LIVE OPERATIONAL DASHBOARD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
}
