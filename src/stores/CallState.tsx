import { create } from 'zustand';

type CallStateState = {
  callState: 'Establishing' | 'Established' | 'Terminated' | null;
  sipError: string;
  sipState: string;
  setCallState: (State: 'Establishing' | 'Established' | 'Terminated' | null) => void;
  setSipError: (Error: string) => void;
  setSipState: (State: string) => void;
}


export const useCallStateStore = create<CallStateState>((set) => ({
  callState: null,
  sipError: '',
  sipState: '',
  setCallState: (state) => set({ callState: state }),
  setSipError: (error) => set({ sipError: error }),
  setSipState: (state) => set({ sipState: state }),
}));