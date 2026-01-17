import { GraphData } from './types';

export const GEMINI_MODEL_CHAT = 'gemini-3-pro-preview';
export const GEMINI_MODEL_CONFIG = 'gemini-3-flash-preview';

export const SYSTEM_INSTRUCTION = `You are Tauri Nexus, an expert AI assistant specialized in the Tauri Framework (tauri-apps/tauri). 
Your goal is to help developers build, debug, and understand secure, cross-platform applications using Rust and Web Technologies.
You have deep knowledge of:
- Rust (backend) and JavaScript/TypeScript (frontend).
- The Tauri Inter-Process Communication (IPC) bridge.
- tauri.conf.json configuration.
- Security best practices (Scope, Permissions, CSP).
- The differences between Tauri v1 and v2.

When providing code, prefer TypeScript for frontend and Rust for backend. Always prioritize security.`;

// Initial dummy data for the visualization representing Tauri Architecture
export const INITIAL_GRAPH_DATA: GraphData = {
  nodes: [
    { id: "Tauri App", group: 1, label: "Tauri App", type: "core" },
    { id: "Core Process", group: 1, label: "Core (Rust)", type: "rust" },
    { id: "WebView", group: 2, label: "WebView", type: "js" },
    { id: "IPC", group: 3, label: "IPC Bridge", type: "bridge" },
    { id: "Window", group: 2, label: "Window", type: "js" },
    { id: "Event Loop", group: 1, label: "Event Loop", type: "rust" },
    { id: "System Tray", group: 1, label: "System Tray", type: "rust" },
    { id: "Menu", group: 1, label: "Menu", type: "rust" },
    { id: "Frontend Framework", group: 2, label: "React/Vue/Svelte", type: "js" },
    { id: "Invoke", group: 3, label: "invoke()", type: "bridge" },
    { id: "Emit", group: 3, label: "emit()", type: "bridge" },
    { id: "Rust Commands", group: 1, label: "#[command]", type: "rust" },
  ],
  links: [
    { source: "Tauri App", target: "Core Process", value: 10 },
    { source: "Tauri App", target: "WebView", value: 10 },
    { source: "Core Process", target: "Event Loop", value: 5 },
    { source: "Core Process", target: "System Tray", value: 3 },
    { source: "Core Process", target: "Menu", value: 3 },
    { source: "WebView", target: "Window", value: 8 },
    { source: "WebView", target: "Frontend Framework", value: 5 },
    { source: "WebView", target: "IPC", value: 10 },
    { source: "Core Process", target: "IPC", value: 10 },
    { source: "IPC", target: "Invoke", value: 5 },
    { source: "IPC", target: "Emit", value: 5 },
    { source: "Invoke", target: "Rust Commands", value: 8 },
  ]
};
