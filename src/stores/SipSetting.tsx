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

const getLocalStorageValue = (key: string, defaultValue: string) => {
  return localStorage.getItem(key) || defaultValue;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  displayName: import.meta.env.VITE_DISPLAY_NAME ?? getLocalStorageValue('displayName', ''),
  sipDomain: import.meta.env.VITE_DOMIN ?? getLocalStorageValue('sipDomain', ''),
  serverAddress: import.meta.env.VITE_ADDRESS ?? getLocalStorageValue('serverAddress', ''),
  username: import.meta.env.VITE_USERNAME ?? getLocalStorageValue('username', ''),
  password: import.meta.env.VITE_PASSWORD ?? getLocalStorageValue('password', ''),
  setDisplayName: (name) => set({ displayName: name }),
  setSipDomain: (domain) => set({ sipDomain: domain }),
  setServerAddress: (address) => set({ serverAddress: address }),
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
}));