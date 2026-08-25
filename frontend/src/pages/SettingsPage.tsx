import React, { useState } from 'react';
import { Settings, Cpu, Volume2, Shield, Moon, Trash2, CheckCircle2, Save } from 'lucide-react';

export const SettingsPage = () => {
  const [model, setModel] = useState(localStorage.getItem('openrouter_model') || 'openai/gpt-4o-mini');
  const [apiKeyOverride, setApiKeyOverride] = useState(localStorage.getItem('openrouter_api_key_override') || '');
  const [autoVoice, setAutoVoice] = useState(localStorage.getItem('auto_voice') === 'true');
  const [memoryRetention, setMemoryRetention] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('openrouter_model', model);
    if (apiKeyOverride.trim()) {
      localStorage.setItem('openrouter_api_key_override', apiKeyOverride.trim());
    } else {
      localStorage.removeItem('openrouter_api_key_override');
    }
    localStorage.setItem('auto_voice', autoVoice ? 'true' : 'false');

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to clear local storage cache? This will reset your active frontend session.')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar pr-1 pb-16 space-y-6">
      
      {/* Header */}
      <div className="pb-6 border-b border-border/50">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          System & Engine Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Configure OpenRouter AI models, inference parameters, voice playback, and privacy
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Settings successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        
        {/* OpenRouter Model Config */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-text-primary">OpenRouter AI Intelligence Engine</h2>
          </div>
          <p className="text-xs text-text-secondary">
            Select which state-of-the-art model powers streaming responses for Krishna, Chhava, and Chanakya.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Primary LLM Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-surface-hover border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:border-primary"
              >
                <option value="openai/gpt-4o-mini">OpenAI: GPT-4o Mini (Default - Ultra Fast)</option>
                <option value="anthropic/claude-3.5-sonnet">Anthropic: Claude 3.5 Sonnet (Highest Reasoning)</option>
                <option value="deepseek/deepseek-chat">DeepSeek: DeepSeek Chat (Deep Logic & Code)</option>
                <option value="google/gemini-2.0-flash-001">Google: Gemini 2.0 Flash (Fast & Multimodal)</option>
                <option value="meta-llama/llama-3.3-70b-instruct:free">Meta: Llama 3.3 70B (Free Open-Source)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Custom OpenRouter Key Override (Optional)</label>
              <input
                type="password"
                value={apiKeyOverride}
                onChange={(e) => setApiKeyOverride(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary focus:border-primary font-mono"
              />
            </div>
          </div>
        </div>

        {/* Voice & Synthesis Settings */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-text-primary">Voice & Speech Preferences</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-surface/40 border border-border cursor-pointer hover:bg-surface-hover transition-colors">
              <input
                type="checkbox"
                checked={autoVoice}
                onChange={(e) => setAutoVoice(e.target.checked)}
                className="rounded border-border bg-surface text-primary focus:ring-primary w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-text-primary block">Auto-play text-to-speech responses</span>
                <span className="text-[11px] text-text-secondary">Automatically speak AI responses when sending voice or chat messages.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Memory & Privacy Settings */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-text-primary">Privacy & Memory Retention</h2>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-2xl bg-surface/40 border border-border cursor-pointer hover:bg-surface-hover transition-colors">
            <input
              type="checkbox"
              checked={memoryRetention}
              onChange={(e) => setMemoryRetention(e.target.checked)}
              className="rounded border-border bg-surface text-primary focus:ring-primary w-4 h-4"
            />
            <div>
              <span className="text-xs font-bold text-text-primary block">Continuous Fact Extraction (Memory Engine)</span>
              <span className="text-[11px] text-text-secondary">Allow your companion to extract key personal milestones, habits, and preferences.</span>
            </div>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="primary-button px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-primary/20"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="text-xs text-red-400 hover:underline flex items-center gap-1.5 p-2"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Local Session Cache
          </button>
        </div>

      </form>

    </div>
  );
};

export default SettingsPage;
