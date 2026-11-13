import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const SettingsPanel: React.FC = () => {
  const isMuted = useGameStore((state) => state.isMuted);
  const isMusicPlaying = useGameStore((state) => state.isMusicPlaying);
  const toggleMute = useGameStore((state) => state.toggleMute);
  const toggleMusic = useGameStore((state) => state.toggleMusic);
  const resetGame = useGameStore((state) => state.resetGame);
  const exportSaveData = useGameStore((state) => state.exportSaveData);
  const importSaveData = useGameStore((state) => state.importSaveData);

  const [copied, setCopied] = useState(false);
  const [importString, setImportString] = useState('');
  const [importError, setImportError] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExport = () => {
    const data = exportSaveData();
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleImport = () => {
    if (!importString.trim()) return;
    const success = importSaveData(importString.trim());
    if (success) {
      setImportSuccess(true);
      setImportError(false);
      setImportString('');
      setTimeout(() => setImportSuccess(false), 2500);
    } else {
      setImportError(true);
      setImportSuccess(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-lg font-black text-slate-800">Game Settings & Save Management</h2>
        <p className="text-xs text-slate-500">
          Configure audio, backup your game progress, or import a previous save.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <h3 className="font-extrabold text-slate-800 text-sm">Audio Controls</h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleMute}
            className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
              !isMuted
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>Sound Effects: {isMuted ? 'Muted' : 'Enabled'}</span>
          </button>

          <button
            onClick={toggleMusic}
            className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
              isMusicPlaying
                ? 'bg-purple-50 border-purple-300 text-purple-800'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Cozy BGM: {isMusicPlaying ? 'Playing' : 'Off'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <h3 className="font-extrabold text-slate-800 text-sm">Backup & Restore Progress</h3>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{copied ? 'Save Code Copied!' : 'Export Save to Clipboard'}</span>
          </button>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Import Save from Text Code:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={importString}
              onChange={(e) => setImportString(e.target.value)}
              placeholder="Paste exported save string here..."
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
          </div>
          {importSuccess && (
            <p className="text-xs font-bold text-emerald-600 mt-1.5">Save successfully restored!</p>
          )}
          {importError && (
            <p className="text-xs font-bold text-rose-600 mt-1.5">
              Invalid or corrupted save code. Please try again.
            </p>
          )}
        </div>
      </div>

      <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4">
        <h3 className="font-extrabold text-rose-900 text-sm flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Danger Zone: Reset Store</span>
        </h3>
        <p className="text-xs text-rose-700 mt-1 mb-3">
          This will wipe your progress and restore the initial $200 store state.
        </p>

        {confirmReset ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetGame();
                setConfirmReset(false);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95"
            >
              Yes, Reset Everything
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-xl border border-rose-300 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Game Progress</span>
          </button>
        )}
      </div>
    </div>
  );
};
