import React, { useState } from 'react';
import { TauriConfigParams } from '../types';
import { geminiService } from '../services/geminiService';
import { FileJson, Save, Cpu } from 'lucide-react';

const ConfigGen: React.FC = () => {
  const [params, setParams] = useState<TauriConfigParams>({
    appName: 'my-tauri-app',
    windowTitle: 'My Awesome App',
    identifier: 'com.example.app',
    width: 800,
    height: 600,
    fullscreen: false,
    resizable: true,
    securityRelaxed: false
  });
  const [generatedConfig, setGeneratedConfig] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const config = await geminiService.generateTauriConfig(params);
      // Format it nicely
      try {
          const parsed = JSON.parse(config);
          setGeneratedConfig(JSON.stringify(parsed, null, 2));
      } catch {
          setGeneratedConfig(config);
      }
    } catch (e) {
      setGeneratedConfig("// Error generating config. Check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-tauri-dark overflow-hidden">
      {/* Form Side */}
      <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto border-r border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-1">Configuration Wizard</h2>
        <p className="text-gray-400 text-sm mb-6">Define your app's baseline properties and let AI structure the JSON.</p>
        
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">App Name</label>
            <input 
              type="text" 
              value={params.appName}
              onChange={e => setParams({...params, appName: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-tauri-accent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Identifier</label>
                <input 
                  type="text" 
                  value={params.identifier}
                  onChange={e => setParams({...params, identifier: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-tauri-accent outline-none"
                />
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Window Title</label>
                <input 
                  type="text" 
                  value={params.windowTitle}
                  onChange={e => setParams({...params, windowTitle: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-tauri-accent outline-none"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Width</label>
                <input 
                  type="number" 
                  value={params.width}
                  onChange={e => setParams({...params, width: parseInt(e.target.value)})}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-tauri-accent outline-none"
                />
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Height</label>
                <input 
                  type="number" 
                  value={params.height}
                  onChange={e => setParams({...params, height: parseInt(e.target.value)})}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-tauri-accent outline-none"
                />
             </div>
          </div>

          <div className="pt-4 space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded bg-gray-900/50 hover:bg-gray-800 transition">
              <input 
                type="checkbox" 
                checked={params.resizable}
                onChange={e => setParams({...params, resizable: e.target.checked})}
                className="w-4 h-4 rounded border-gray-600 text-tauri-accent focus:ring-tauri-accent bg-gray-700"
              />
              <span className="text-sm text-gray-300">Resizable Window</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded bg-gray-900/50 hover:bg-gray-800 transition">
              <input 
                type="checkbox" 
                checked={params.fullscreen}
                onChange={e => setParams({...params, fullscreen: e.target.checked})}
                className="w-4 h-4 rounded border-gray-600 text-tauri-accent focus:ring-tauri-accent bg-gray-700"
              />
              <span className="text-sm text-gray-300">Start Fullscreen</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded border border-red-900/30 bg-red-900/10 hover:bg-red-900/20 transition">
              <input 
                type="checkbox" 
                checked={params.securityRelaxed}
                onChange={e => setParams({...params, securityRelaxed: e.target.checked})}
                className="w-4 h-4 rounded border-red-600 text-red-500 focus:ring-red-500 bg-gray-700"
              />
              <span className="text-sm text-red-300">Relax Security (Dev Only)</span>
            </label>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full mt-6 py-3 bg-gradient-to-r from-tauri-orange to-tauri-accent text-gray-900 font-bold rounded-lg shadow-lg hover:shadow-tauri-orange/20 transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? <Cpu className="animate-spin" /> : <FileJson />}
            {isGenerating ? 'Generating...' : 'Generate tauri.conf.json'}
          </button>
        </div>
      </div>

      {/* Output Side */}
      <div className="w-full md:w-1/2 p-6 bg-gray-900 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Output</h3>
          <button className="text-xs flex items-center gap-1 text-tauri-blue hover:text-white transition">
            <Save size={14} /> Save to file
          </button>
        </div>
        <div className="flex-1 bg-black rounded-lg border border-gray-800 p-4 font-mono text-sm overflow-auto text-gray-300 shadow-inner">
           {generatedConfig ? (
             <pre>{generatedConfig}</pre>
           ) : (
             <div className="h-full flex items-center justify-center text-gray-600 italic">
               Waiting for generation...
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ConfigGen;
