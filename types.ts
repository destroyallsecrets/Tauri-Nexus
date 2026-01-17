export enum AppMode {
  CHAT = 'CHAT',
  VISUALIZER = 'VISUALIZER',
  CONFIG_GEN = 'CONFIG_GEN'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface TauriConfigParams {
  appName: string;
  windowTitle: string;
  identifier: string;
  width: number;
  height: number;
  fullscreen: boolean;
  resizable: boolean;
  securityRelaxed: boolean;
}

export interface NodeData {
  id: string;
  group: number;
  label: string;
  type: 'rust' | 'js' | 'core' | 'bridge';
}

export interface LinkData {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}
