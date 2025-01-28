export interface ElectronAPI {
  ipcRenderer: {
    on: (channel: string, listener: (event: any, message: any) => void) => void;
    send: (channel: string, data?: any) => void;
    removeAllListeners: (channel: string) => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}