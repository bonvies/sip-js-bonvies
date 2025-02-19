import { create } from 'zustand';

type CallStateState = {
  callState: string;
  setCallState: (State: string) => void;
}


export const useCallStateStore = create<CallStateState>((set) => ({
  callState: '',
  setCallState: (name) => set({ callState: name }),
}));