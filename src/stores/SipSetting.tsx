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
  displayName: getLocalStorageValue('displayName', ''),
  sipDomain: getLocalStorageValue('sipDomain', ''),
  serverAddress: getLocalStorageValue('serverAddress', ''),
  username: getLocalStorageValue('username', ''),
  password: getLocalStorageValue('password', ''),
  setDisplayName: (name) => set({ displayName: name }),
  setSipDomain: (domain) => set({ sipDomain: domain }),
  setServerAddress: (address) => set({ serverAddress: address }),
  setUsername: (username) => set({ username }),
  setPassword: (password) => set({ password }),
}));