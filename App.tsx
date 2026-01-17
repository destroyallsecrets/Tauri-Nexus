import React, { useState } from 'react';
import { MessageSquare, Network, Settings, Github, Code } from 'lucide-react';
import ChatArea from './components/ChatArea';
import ArchitectureVis from './components/ArchitectureVis';
import ConfigGen from './components/ConfigGen';
import { AppMode } from './types';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);

  const NavItem = ({ m, icon: Icon, label }: { m: AppMode, icon: any, label: string }) => (
    <button
      onClick={() => setMode(m)}
      className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 group ${
        mode === m 
          ? 'bg-tauri-accent text-gray-900 shadow-lg shadow-tauri-accent/20' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
      }`}
    >
      <Icon size={24} className={mode === m ? 'stroke-2' : 'stroke-1.5'} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen w-screen bg-tauri-dark text-white font-sans overflow-hidden selection:bg-tauri-accent selection:text-black">
      {/* Navigation Sidebar */}
      <div className="w-20 bg-tauri-card border-r border-gray-800 flex flex-col items-center py-6 gap-6 z-10">
        <div className="mb-2">
           <div className="w-10 h-10 bg-gradient-to-br from-tauri-blue to-tauri-accent rounded-lg flex items-center justify-center shadow-lg shadow-tauri-blue/20">
             <Code className="text-black" size={24} />
           </div>
        </div>

        <nav className="flex-1 flex flex-col gap-4 w-full px-2">
          <NavItem m={AppMode.CHAT} icon={MessageSquare} label="Chat" />
          <NavItem m={AppMode.VISUALIZER} icon={Network} label="Arch" />
          <NavItem m={AppMode.CONFIG_GEN} icon={Settings} label="Config" />
        </nav>

        <a 
          href="https://github.com/tauri-apps/tauri" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 text-gray-500 hover:text-white transition-colors"
          title="Open Tauri GitHub"
        >
          <Github size={24} />
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex flex-col min-w-0">
        <header className="h-14 border-b border-gray-800 bg-tauri-card/50 backdrop-blur-sm flex items-center px-6 justify-between">
           <h1 className="font-semibold text-lg tracking-tight text-gray-200">
             {mode === AppMode.CHAT && "Nexus Assistant"}
             {mode === AppMode.VISUALIZER && "Architecture Explorer"}
             {mode === AppMode.CONFIG_GEN && "Configuration Wizard"}
           </h1>
           <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              Gemini 2.0 Connected
           </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          {mode === AppMode.CHAT && <ChatArea />}
          {mode === AppMode.VISUALIZER && <ArchitectureVis />}
          {mode === AppMode.CONFIG_GEN && <ConfigGen />}
        </main>
      </div>
    </div>
  );
}

export default App;
