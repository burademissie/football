'use client';

import { useState } from 'react';
import { RefreshCw, Zap, Database, CheckCircle, XCircle, Settings } from 'lucide-react';

interface ActionResult {
  success: boolean;
  message: string;
}

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/sync');
      const data = await response.json();
      
      setResult({
        success: data.success,
        message: data.success 
          ? `Synced ${data.synced.leagues} leagues, ${data.synced.teams} teams, ${data.synced.matches} matches`
          : data.error || 'Sync failed',
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to connect to server',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGeneratePredictions = async () => {
    setIsGenerating(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/predictions/generate');
      const data = await response.json();
      
      setResult({
        success: data.success,
        message: data.success 
          ? `Generated ${data.predictionsGenerated} predictions`
          : data.error || 'Generation failed',
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to connect to server',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--accent-primary)] text-[var(--bg-primary)] flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
        title="Admin Panel"
      >
        <Settings className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 card p-4 shadow-2xl z-50 border-[var(--accent-primary)]/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[var(--accent-primary)]" />
          Admin Panel
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[var(--text-muted)] hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full btn-secondary flex items-center justify-center gap-2 py-3"
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          {isSyncing ? 'Syncing Data...' : 'Sync from API-Football'}
        </button>

        <button
          onClick={handleGeneratePredictions}
          disabled={isGenerating}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {isGenerating ? 'Generating...' : 'Generate Predictions'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
          result.success 
            ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30' 
            : 'bg-[var(--accent-danger)]/10 border border-[var(--accent-danger)]/30'
        }`}>
          {result.success ? (
            <CheckCircle className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-[var(--accent-danger)] flex-shrink-0" />
          )}
          <p className="text-sm text-[var(--text-secondary)]">{result.message}</p>
        </div>
      )}

      {/* Info */}
      <p className="mt-4 text-xs text-[var(--text-muted)] text-center">
        Sync fetches latest data • Predictions use Poisson model
      </p>
    </div>
  );
}
