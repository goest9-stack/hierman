import React from 'react';
import { Settings, Trash2, Cpu, Zap } from './Icons';
import { GenerationConfig } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: GenerationConfig;
  onConfigChange: (config: GenerationConfig) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onClearChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
  selectedModel,
  onModelChange,
  onClearChat
}) => {
  return (
    <div 
      className={`fixed inset-y-0 left-0 z-50 w-80 bg-coporties-dark border-r border-coporties-border transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0 lg:w-72 flex flex-col`}
    >
      {/* Header */}
      <div className="p-6 border-b border-coporties-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-coporties-red font-bold text-xl tracking-wider">
          <Zap className="w-6 h-6" />
          <span>COPORTIES</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-coporties-muted hover:text-white">
          <span className="sr-only">Close</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Model Selection */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-coporties-muted uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4" /> AI Model
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => onModelChange('gemini-3-flash-preview')}
              className={`text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                selectedModel === 'gemini-3-flash-preview'
                  ? 'bg-coporties-red/10 border-coporties-red text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                  : 'bg-coporties-surface border-coporties-border text-coporties-muted hover:border-coporties-muted'
              }`}
            >
              <div className="font-medium text-sm">Gemini 3 Flash</div>
              <div className="text-[10px] opacity-70 mt-1">Ultra-fast logic & reasoning</div>
            </button>
            <button
              onClick={() => onModelChange('gemini-3-pro-preview')}
              className={`text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                selectedModel === 'gemini-3-pro-preview'
                  ? 'bg-coporties-red/10 border-coporties-red text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                  : 'bg-coporties-surface border-coporties-border text-coporties-muted hover:border-coporties-muted'
              }`}
            >
              <div className="font-medium text-sm">Gemini 3 Pro</div>
              <div className="text-[10px] opacity-70 mt-1">Complex reasoning & coding</div>
            </button>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-coporties-muted uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4" /> Configuration
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-coporties-text">
              <label>Temperature</label>
              <span className="text-coporties-red">{config.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={(e) => onConfigChange({ ...config, temperature: parseFloat(e.target.value) })}
              className="w-full h-1 bg-coporties-border rounded-lg appearance-none cursor-pointer accent-coporties-red"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-coporties-text block">System Instructions</label>
            <textarea
              value={config.systemInstruction || ''}
              onChange={(e) => onConfigChange({ ...config, systemInstruction: e.target.value })}
              placeholder="You are a helpful assistant..."
              className="w-full bg-coporties-surface border border-coporties-border rounded-lg p-3 text-xs text-coporties-text focus:outline-none focus:border-coporties-red resize-none h-24"
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-coporties-border">
        <button
          onClick={onClearChat}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-coporties-surface border border-coporties-border text-coporties-red hover:bg-coporties-red hover:text-white transition-colors duration-200 text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Clear Conversation
        </button>
      </div>
    </div>
  );
};

export default Sidebar;