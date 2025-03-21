import { create } from 'zustand';

type CallStateState = {
  callType: 'Inviter' | 'Invitation' | null;
  callState: 'Establishing' | 'Established' | 'Terminated' | null;
  sipError: string;
  sipState: string;
  setCallType: (Type: 'Inviter' | 'Invitation' | null) => void;
  setCallState: (State: 'Establishing' | 'Established' | 'Terminated' | null) => void;
  setSipState: (State: string) => void;
}


export const useCallStateStore = create<CallStateState>((set) => ({
  callType: null,
  callState: null,
  sipError: '',
  sipState: '',
  setCallType: (type) => set({ callType: type }),
  setCallState: (state) => set({ callState: state }),
  setSipState: (state) => set({ sipState: state }),
}));