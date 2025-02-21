import React, { createContext, useState, useCallback, useRef, ReactNode } from 'react';
import { UserAgent, Inviter, SessionState } from 'sip.js';
import { useSettingsStore } from '../stores/SipSetting';
import { useCallStateStore } from '../stores/CallState';

// 創建一個 Context
type SipCodeContextType = {
  initUserAgent: () => void;
  startUserAgent: () => Promise<void>;
  stopUserAgent: () => Promise<void>;
  makeCall: (phoneNumber: string) => void;
  hangUpCall: () => Promise<void>;
  sendDtmf: (digit: string) => void;
  playRemoteAudio: (remoteStream: MediaStream) => void;
  playRemoteVideo: (remoteStream: MediaStream) => void;
  playLocalVideo: () => Promise<void>;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  dtmfAudioRef: React.RefObject<HTMLAudioElement | null>;
  ringbackAudioRef: React.RefObject<HTMLAudioElement | null>;
}

const SipCodeContext = createContext<SipCodeContextType>({
  initUserAgent: () => {},
  startUserAgent: async () => {},
  stopUserAgent: async () => {},
  makeCall: () => {},
  hangUpCall: async () => {},
  sendDtmf: () => {},
  playRemoteAudio: () => {},
  playRemoteVideo: () => {},
  playLocalVideo: async () => {},
  remoteAudioRef: { current: null as HTMLAudioElement | null },
  localVideoRef: { current: null as HTMLVideoElement | null }, 
  remoteVideoRef: { current: null as HTMLVideoElement | null },
  dtmfAudioRef: { current: null as HTMLAudioElement | null },
  ringbackAudioRef: { current: null as HTMLAudioElement | null },
});

// 創建一個 Provider 組件
export const SipCodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setSipState, setCallState, setSipError } = useCallStateStore();
  const { displayName, username, password, serverAddress: wsServer, sipDomain: domain } = useSettingsStore();

  const [userAgentState, setUserAgentState] = useState<UserAgent>();
  const [currentInviter, setCurrentInviter] = useState<Inviter | null>();

  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const domainList = domain.split(',');
  const uri = UserAgent.makeURI(`sip:${username}@${domainList[0]}`);

  const dtmfAudioRef = useRef<HTMLAudioElement>(null);
  const ringbackAudioRef = useRef<HTMLAudioElement>(null);

  const initUserAgent = useCallback(() => {
    if (!uri || !wsServer) {
      return null;
    }
    try {
      const ua = new UserAgent({
        uri,
        displayName,
        authorizationUsername: username,
        authorizationPassword: password,
        transportOptions: {
          server: wsServer,
        },
      });
      setUserAgentState(ua);
    } catch (error) {
      console.error('Failed to create UserAgent:', error);
      return null;
    }
  }, [uri, wsServer, displayName, username, password]);

  const startUserAgent = useCallback(async () => {
    if (!userAgentState) {
      console.error('UserAgent not initialized');
      setSipError('UserAgent not initialized');
      return;
    }
    try {
      await userAgentState.start();
      setSipState('UserAgent started');
    } catch (error) {
      console.error('Failed to start UserAgent:', error);
      setSipError('Failed to start UserAgent');
    }
  }, [userAgentState, setSipError, setSipState]);

  const stopUserAgent = useCallback(async () => {
    if (!userAgentState) {
      console.error('UserAgent not initialized');
      setSipError('UserAgent not initialized');
      return;
    }
    try {
      await userAgentState.stop();
      setSipState('UserAgent stopped');
    } catch (error) {
      console.error('Failed to stop UserAgent:', error);
      setSipError('Failed to stop UserAgent');
    }
  }, [userAgentState, setSipError, setSipState]);

  const playDtmfSound = useCallback(() => {
    if (dtmfAudioRef.current) {
      dtmfAudioRef.current.currentTime = 0;
      dtmfAudioRef.current.play().catch(error => console.error('Failed to play DTMF sound:', error));
    }
  }, []);

  const playRingbackTone = useCallback(() => {
    if (ringbackAudioRef.current) {
      ringbackAudioRef.current.loop = true;
      ringbackAudioRef.current.play().catch(error => console.error('Failed to play ringback tone:', error));
    }
  }, []);

  const stopRingbackTone = useCallback(() => {
    if (ringbackAudioRef.current) {
      ringbackAudioRef.current.pause();
      ringbackAudioRef.current.currentTime = 0;
    }
  }, []);

  const playRemoteAudio = useCallback((remoteStream: MediaStream) => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(error => console.error('Failed to play audio:', error));
    }
  }, []);

  const playRemoteVideo = useCallback((remoteStream: MediaStream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current?.play().catch(error => console.error('Failed to play video:', error));
    }
  }, []);

  const playLocalVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const localVideoElement = localVideoRef.current as HTMLVideoElement;
      if (localVideoElement) {
        localVideoElement.srcObject = stream;
        localVideoElement.play().catch(error => console.error('Failed to play local video:', error));
      }
    } catch (error) {
      console.error('Failed to get local media:', error);
    }
  }, []);

  const handleSessionStateChange = useCallback((state: SessionState, inviter: Inviter) => {
    switch (state) {
      case SessionState.Establishing: {
        setCallState("Establishing");
        playRingbackTone();
        break;
      }
      case SessionState.Established: {
        setCallState("Established");
        stopRingbackTone();
      
        if (inviter) {
          const remoteStream = new MediaStream();
          if (inviter.sessionDescriptionHandler) {
            const peerConnection = (inviter.sessionDescriptionHandler as unknown as { peerConnection: RTCPeerConnection }).peerConnection;
            peerConnection.getReceivers().forEach((receiver: { track: MediaStreamTrack; }) => {
              if (receiver.track) {
                remoteStream.addTrack(receiver.track);
              }
            });
      
            playRemoteAudio(remoteStream);
            playRemoteVideo(remoteStream);
          }
        }
        break;
      }
      case SessionState.Terminated:
        setCallState("Terminated");
        stopRingbackTone();
        setTimeout(() => {
          setCallState(null);
        }, 1500);
        setCurrentInviter(null);
        break;
      default:
        break;
    }
  }, [playRemoteAudio, playRemoteVideo, playRingbackTone, setCallState, stopRingbackTone]);

  const initInviter = useCallback(async (phoneNumber: string) => {
    const targetURI = UserAgent.makeURI(`sip:${phoneNumber}@${domainList[0]}`);
    if (!targetURI || !userAgentState) {
      console.error('Invalid target URI or UserAgent not initialized');
      setSipState('Invalid target URI or UserAgent not initialized');
      return;
    }
    const inviter = new Inviter(userAgentState, targetURI, {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: true,
        },
      },
    });
    inviter.stateChange.addListener((state) => handleSessionStateChange(state, inviter));
    try {
      await inviter.invite();
      setCurrentInviter(inviter);
    } catch (error) {
      console.error('Failed to make call:', error);
      setSipError('Failed to make call');
    }
  }, [domainList, userAgentState, setSipState, handleSessionStateChange, setSipError]);

  const makeCall = useCallback((phoneNumber: string) => {
    if (!userAgentState) {
      console.error('UserAgent not initialized');
      setSipError('UserAgent not initialized');
      return;
    }

    initInviter(phoneNumber);
  }, [userAgentState, initInviter, setSipError]);

  const hangUpCall = useCallback(async () => {
    if (currentInviter) {
      if (currentInviter.state === SessionState.Establishing) {
        try {
          await currentInviter.cancel();
          setSipState("Call canceled");
        } catch (error) {
          console.error('Failed to cancel call:', error);
          setSipError('Failed to cancel call');
        }
      } else {
        try {
          await currentInviter.bye();
          setSipState("Call ended");
        } catch (error) {
          console.error('Failed to end call:', error);
          setSipError('Failed to end call');
        }
      }
      setCurrentInviter(null);
    } else {
      setSipState('No active call to hang up or cancel');
    }
  }, [currentInviter, setSipError, setSipState]);

  const sendDtmf = useCallback((digit: string) => {
    playDtmfSound();
    if (currentInviter && currentInviter.state === SessionState.Established) {
      const sessionDescriptionHandler = currentInviter.sessionDescriptionHandler;
      if (sessionDescriptionHandler) {
        sessionDescriptionHandler.sendDtmf(digit);
      }
    }
  }, [currentInviter, playDtmfSound]);

  return (
    <SipCodeContext.Provider value={{
      initUserAgent,
      startUserAgent,
      stopUserAgent,
      makeCall,
      hangUpCall,
      sendDtmf,
      playRemoteAudio,
      playRemoteVideo,
      playLocalVideo,
      remoteAudioRef,
      localVideoRef,
      remoteVideoRef,
      dtmfAudioRef,
      ringbackAudioRef,
    }}>
      {children}
    </SipCodeContext.Provider>
  );
};

export default SipCodeContext;