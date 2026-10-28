import React, { useState } from 'react';
import { 
  Settings, 
  Cpu, 
  Database, 
  Server, 
  BookOpen, 
  Check, 
  Copy, 
  ExternalLink, 
  X,
  AlertCircle,
  HardDrive,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { 
  AI_PROVIDERS, 
  SUPPORTING_TOOLS, 
  HOSTED_PROVIDERS, 
  evaluateHardwareCompatibility 
} from '../../services/aiEngine';
import { AppSettings, getSupabaseMigrationSQL } from '../../services/database';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onRunDiagnostics?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'providers' | 'worker' | 'database'>('guide');
  const [workerUrl, setWorkerUrl] = useState(settings.selfHostedWorkerUrl || 'http://localhost:8000');
  const [vramTestValue, setVramTestValue] = useState<number>(8);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const vramEvaluation = evaluateHardwareCompatibility(vramTestValue);

  const handleCopySQL = () => {
    navigator.clipboard.writeText(getSupabaseMigrationSQL());
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  const handleSave = () => {
    onSaveSettings({
      selfHostedWorkerUrl: workerUrl,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#202227] border border-zinc-700/80 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Studio Settings & Free AI Stack Architecture</h2>
              <p className="text-xs text-zinc-400">Configure open-source 3D engines, hardware VRAM requirements, and database migrations</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/60 px-5 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Free-First AI Engine Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'providers'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Model Engines & Hardware</span>
          </button>
          <button
            onClick={() => setActiveTab('worker')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'worker'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Self-Hosted GPU Worker API</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'database'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase PostgreSQL Schema</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* TAB 1: FREE-FIRST AI ENGINE GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-5">
              {/* Architecture Intro */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Image3D Studio Free-First Architecture</span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-xs">
                  You do not need costly commercial APIs to build a professional image-to-3D application. Start with open-weight foundation models (<strong>TripoSR</strong>, <strong>TRELLIS</strong>, <strong>Hunyuan3D</strong>) connected to your own backend. An open-source model can be free to run on your own hardware, whereas hosted inference endpoints charge for GPU compute time.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-zinc-400">
                  <span className="text-amber-300 font-semibold">Recommended Start:</span>
                  <span>TripoSR (MIT License)</span>
                  <span>·</span>
                  <span>rembg (Local U2-Net)</span>
                  <span>·</span>
                  <span>Three.js Viewport</span>
                  <span>·</span>
                  <span>FastAPI + Blender Python</span>
                </div>
              </div>

              {/* Interactive GPU VRAM Compatibility Evaluator */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-zinc-100 text-sm flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-sky-400" />
                    <span>Interactive GPU VRAM Compatibility Evaluator</span>
                  </div>
                  <span className="text-amber-400 font-mono font-bold">{vramTestValue} GB VRAM Selected</span>
                </div>
                <p className="text-zinc-400 text-xs">
                  Select your available GPU memory to check which open-source models can run locally on your workstation or cloud instance:
                </p>

                {/* Quick VRAM buttons */}
                <div className="flex flex-wrap gap-2">
                  {[4, 6, 8, 12, 16, 24].map((gb) => (
                    <button
                      key={gb}
                      onClick={() => setVramTestValue(gb)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors ${
                        vramTestValue === gb
                          ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {gb} GB VRAM
                    </button>
                  ))}
                </div>

                {/* Result Recommendation */}
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <p className="text-zinc-200 text-xs leading-relaxed">
                      {vramEvaluation.recommendation}
                    </p>
                  </div>

                  {/* Compatibility Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                    {Object.values(AI_PROVIDERS).map((prov) => {
                      const isSupported = vramEvaluation.supportedModels.includes(prov.id);
                      return (
                        <div
                          key={prov.id}
                          className={`p-2.5 rounded-lg border flex items-center justify-between ${
                            isSupported
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                              : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-xs text-zinc-200">{prov.name.split(' (')[0]}</div>
                            <div className="text-[10px] font-mono text-zinc-400">Min: {prov.minVRAM.split(' ')[0]}</div>
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isSupported
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            {isSupported ? 'Compatible' : 'Insufficient VRAM'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Supporting Free Stack Table */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                <div className="font-semibold text-zinc-100 text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Essential Free Supporting Tools & APIs</span>
                </div>
                <p className="text-zinc-400 text-xs">
                  These supporting libraries handle foreground segmentation, mesh cleanup, WebGL viewing, and automated Blender project bundling:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[11px]">
                        <th className="py-2 px-3 font-semibold">Tool / API</th>
                        <th className="py-2 px-3 font-semibold">What It Does</th>
                        <th className="py-2 px-3 font-semibold">Free Approach</th>
                        <th className="py-2 px-3 font-semibold">License</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                      {SUPPORTING_TOOLS.map((tool) => (
                        <tr key={tool.name} className="hover:bg-zinc-800/40">
                          <td className="py-2.5 px-3 font-bold text-amber-400">
                            <a href={tool.link} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                              <span>{tool.name}</span>
                              <ExternalLink className="w-3 h-3 text-zinc-500" />
                            </a>
                          </td>
                          <td className="py-2.5 px-3 text-zinc-300 font-sans">{tool.role}</td>
                          <td className="py-2.5 px-3 text-zinc-400 font-sans">{tool.approach}</td>
                          <td className="py-2.5 px-3 text-emerald-400">{tool.license}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hosted API Considerations */}
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                <div className="font-semibold text-zinc-100 text-sm">Hosted Provider Alternatives (GPU Pricing Disclosure)</div>
                <p className="text-zinc-400 text-xs">
                  If running a local GPU machine is not feasible, here are cloud inference platforms with pay-per-second GPU rates:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {HOSTED_PROVIDERS.map((hp) => (
                    <div key={hp.provider} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
                      <div className="font-bold text-zinc-200 text-xs">{hp.provider}</div>
                      <p className="text-zinc-400 text-[11px]">{hp.usageGuide}</p>
                      <div className="text-amber-400 text-[10px] font-mono pt-1">{hp.pricingNotes}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI PROVIDERS SPECIFICATIONS */}
          {activeTab === 'providers' && (
            <div className="space-y-3">
              <p className="text-zinc-400 leading-relaxed text-xs">
                Image3D Studio supports multiple open-source and hosted image-to-3D model families. Below are verified specifications, licenses, and minimum GPU VRAM requirements.
              </p>

              <div className="space-y-3">
                {Object.values(AI_PROVIDERS).map((prov) => (
                  <div key={prov.id} className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-zinc-100 text-sm flex items-center gap-2">
                          <span>{prov.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono font-normal">by {prov.developer}</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{prov.description}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700 uppercase">
                        {prov.mode.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono text-zinc-400">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Min VRAM:</span>
                        <span className="text-zinc-200">{prov.minVRAM}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Commercial Use:</span>
                        <span className={prov.commercialUse === 'Allowed' ? 'text-emerald-400' : 'text-amber-400'}>
                          {prov.commercialUse}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">PBR Textures:</span>
                        <span className="text-zinc-200">{prov.supportsPBRTextures ? 'Yes' : 'No'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Avg Speed:</span>
                        <span className="text-amber-400">{prov.avgGenerationTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SELF-HOSTED GPU WORKER */}
          {activeTab === 'worker' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                <div className="font-semibold text-zinc-100 text-sm">Self-Hosted FastAPI / PyTorch Worker Endpoint</div>
                <p className="text-zinc-400 leading-relaxed text-xs">
                  Connect your local GPU workstation or cloud instance (RunPod, Lambda Labs, AWS G5) running the included Python FastAPI backend (<code className="text-amber-400 font-mono">/backend/main.py</code>).
                </p>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Worker Base URL</label>
                  <input
                    type="text"
                    value={workerUrl}
                    onChange={(e) => setWorkerUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] font-mono text-zinc-500">
                    Default: http://localhost:8000 (FastAPI Backend)
                  </div>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {saveSuccess ? <Check className="w-4 h-4" /> : null}
                    <span>Save Configuration</span>
                  </button>
                </div>
              </div>

              {/* Local GPU Run Commands */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="font-mono text-zinc-300 font-bold text-xs">To Launch Local Python AI Worker:</div>
                <pre className="p-3 bg-black/60 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto">
{`cd backend
pip install -r requirements.txt
python main.py --host 0.0.0.0 --port 8000`}
                </pre>
              </div>

              {/* Docker Compose Command */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="font-mono text-zinc-300 font-bold text-xs">Or Launch with Docker NVIDIA Container Toolkit:</div>
                <pre className="p-3 bg-black/60 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto">
{`docker compose up --build`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: SUPABASE DATABASE */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm">Supabase PostgreSQL Schema</h3>
                  <p className="text-zinc-400 text-xs">
                    Complete SQL migration script including RLS policies, tables, and indexes.
                  </p>
                </div>
                <button
                  onClick={handleCopySQL}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSQL ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSQL ? 'Copied to Clipboard' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-mono text-zinc-300 max-h-[340px] overflow-y-auto leading-relaxed">
                  {getSupabaseMigrationSQL()}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
