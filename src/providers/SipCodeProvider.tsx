import React, { createContext, useState, useCallback, useRef, ReactNode } from 'react';
import { UserAgent, Inviter, SessionState } from 'sip.js';
import { useSettingsStore } from '../stores/SipSetting';
import { useCallStateStore } from '../stores/CallState';

// 創建一個 Context，定義 SIP 應用的功能和狀態
type SipCodeContextType = {
  initUserAgent: () => void; // 初始化 UserAgent
  startUserAgent: () => Promise<void>; // 啟動 UserAgent
  stopUserAgent: () => Promise<void>; // 停止 UserAgent
  makeCall: (phoneNumber: string) => void; // 發起通話
  hangUpCall: () => Promise<void>; // 結束通話
  sendDtmf: (digit: string) => void; // 發送 DTMF 音
  playRemoteAudio: (remoteStream: MediaStream) => void; // 播放遠端音頻
  playRemoteVideo: (remoteStream: MediaStream) => void; // 播放遠端視頻
  playLocalVideo: () => Promise<void>; // 播放本地視頻
  toggleVideo: () => Promise<void>; // 切換視頻
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>; // 遠端音頻引用
  localVideoRef: React.RefObject<HTMLVideoElement | null>; // 本地視頻引用
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>; // 遠端視頻引用
  dtmfAudioRef: React.RefObject<HTMLAudioElement | null>; // DTMF 音頻引用
  ringbackAudioRef: React.RefObject<HTMLAudioElement | null>; // 回鈴音音頻引用
  isVideoEnabled: boolean; // 視頻是否啟用
}

// 創建一個 Context，提供預設值
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
  toggleVideo: async () => {},
  remoteAudioRef: { current: null as HTMLAudioElement | null },
  localVideoRef: { current: null as HTMLVideoElement | null }, 
  remoteVideoRef: { current: null as HTMLVideoElement | null },
  dtmfAudioRef: { current: null as HTMLAudioElement | null },
  ringbackAudioRef: { current: null as HTMLAudioElement | null },
  isVideoEnabled: true,
});

// 創建一個 Provider 組件，提供 SIP 功能和狀態
export const SipCodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setSipState, setCallState, setSipError } = useCallStateStore(); // 使用 CallState store
  const { displayName, username, password, serverAddress: wsServer, sipDomain: domain } = useSettingsStore(); // 使用 Settings store

  const [userAgentState, setUserAgentState] = useState<UserAgent>(); // UserAgent 狀態
  const [currentInviter, setCurrentInviter] = useState<Inviter | null>(); // 當前的 Inviter
  const [isVideoEnabled, setIsVideoEnabled] = useState(true); // 視頻是否啟用

  const remoteAudioRef = useRef<HTMLAudioElement>(null); // 遠端音頻引用
  const localVideoRef = useRef<HTMLVideoElement>(null); // 本地視頻引用
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // 遠端視頻引用

  const domainList = domain.split(','); // 分割 SIP 域
  const uri = UserAgent.makeURI(`sip:${username}@${domainList[0]}`); // 創建 URI

  const dtmfAudioRef = useRef<HTMLAudioElement>(null); // DTMF 音頻引用
  const ringbackAudioRef = useRef<HTMLAudioElement>(null); // 回鈴音音頻引用

  // 初始化 UserAgent
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

  // 啟動 UserAgent
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

  // 停止 UserAgent
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

  // 播放 DTMF 音效
  const playDtmfSound = useCallback(() => {
    if (dtmfAudioRef.current) {
      dtmfAudioRef.current.currentTime = 0;
      dtmfAudioRef.current.play().catch(error => console.error('Failed to play DTMF sound:', error));
    }
  }, []);

  // 播放回鈴音
  const playRingbackTone = useCallback(() => {
    if (ringbackAudioRef.current) {
      ringbackAudioRef.current.loop = true;
      ringbackAudioRef.current.play().catch(error => console.error('Failed to play ringback tone:', error));
    }
  }, []);

  // 停止回鈴音
  const stopRingbackTone = useCallback(() => {
    if (ringbackAudioRef.current) {
      ringbackAudioRef.current.pause();
      ringbackAudioRef.current.currentTime = 0;
    }
  }, []);

  // 播放遠端音頻
  const playRemoteAudio = useCallback((remoteStream: MediaStream) => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(error => console.error('Failed to play audio:', error));
    }
  }, []);

  // 播放遠端視頻
  const playRemoteVideo = useCallback((remoteStream: MediaStream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current?.play().catch(error => console.error('Failed to play video:', error));
    }
  }, []);

  // 播放本地視頻
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

  // 處理會話狀態變更
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

  // 初始化 Inviter
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

  // 發起通話
  const makeCall = useCallback((phoneNumber: string) => {
    if (!userAgentState) {
      console.error('UserAgent not initialized');
      setSipError('UserAgent not initialized');
      return;
    }

    initInviter(phoneNumber);
  }, [userAgentState, initInviter, setSipError]);

  // 結束通話
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

  // 發送 DTMF 音
  const sendDtmf = useCallback((digit: string) => {
    playDtmfSound();
    if (currentInviter && currentInviter.state === SessionState.Established) {
      const sessionDescriptionHandler = currentInviter.sessionDescriptionHandler;
      if (sessionDescriptionHandler) {
        sessionDescriptionHandler.sendDtmf(digit);
      }
    }
  }, [currentInviter, playDtmfSound]);

  // 切換視訊模式
  const toggleVideo = useCallback(async () => {
    if (currentInviter && currentInviter.sessionDescriptionHandler) {
      const peerConnection = (currentInviter.sessionDescriptionHandler as unknown as { peerConnection: RTCPeerConnection }).peerConnection;
      const localStream = peerConnection.getSenders().find((sender: RTCRtpSender) => sender.track?.kind === 'video')?.track;
      
      if (localStream) {
        setIsVideoEnabled((prev)=>{
          localStream.enabled = !prev;
          return !prev;
        });
      }
    }
  }, [currentInviter]);

  // 提供 SIP 功能和狀態給子組件
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
      toggleVideo,
      remoteAudioRef,
      localVideoRef,
      remoteVideoRef,
      dtmfAudioRef,
      ringbackAudioRef,
      isVideoEnabled
    }}>
      {children}
    </SipCodeContext.Provider>
  );
};

export default SipCodeContext;