import { create } from 'zustand';

type SettingsState = {
  displayName: string;
  sipDomain: string;
  serverAddress: string;
  username: string;
  password: string;
  setDisplayName: (name: string) => void;
  setSipDomain: (domain: string) => void;
  setServerAddress: (address: string) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
}

// const getLocalStorageValue = (key: string, defaultValue: string) => {
//   return localStorage.getItem(key) || defaultValue;
// };

export const useSettingsStore = create<SettingsState>((set) => ({
  displayName: 'ASUS IoT',
  sipDomain: 'asustw.sbc.telesale.org',
  serverAddress: 'wss://asustw.sbc.telesale.org:7443/ws',
  username: '3005',
  password: '1234qwerQWER',
  setDisplayName: (name) => set({ displayName: name }),
  setSipDomain: (domain) => set({ sipDomain: domain }),
  setServerAddress: (address) => set({ serverAddress: address }),
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
}));