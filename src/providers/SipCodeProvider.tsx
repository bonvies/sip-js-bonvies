import React, { createContext, useCallback, useRef, ReactNode } from 'react';
import { UserAgent, Inviter, SessionState, Invitation, Registerer, InvitationAcceptOptions, UserAgentDelegate } from 'sip.js';
import { useSettingsStore } from '../stores/SipSetting';
import { useCallStateStore } from '../stores/CallState';

// 創建一個 Context，定義 SIP 應用的功能和狀態
type SipCodeContextType = {
  initUserAgent: () => void; // 初始化 UserAgent
  startUserAgent: () => Promise<void>; // 啟動 UserAgent
  stopUserAgent: () => Promise<void>; // 停止 UserAgent
  registerUserAgent: () => Promise<void>; // 註冊 UserAgent
  unRegisterUserAgent: () => Promise<void>; // 解除註冊 UserAgent
  makeCall: (phoneNumber: string) => void; // 發起通話
  hangUpCall: () => Promise<void>; // 結束通話
  sendDtmf: (digit: string) => void; // 發送 DTMF 音
  answerCall: () => Promise<void>; // 接聽來電
  delegateUserAgent: <T extends keyof UserAgentDelegate>(eventType: T, toDoFn: UserAgentDelegate[T]) => void; // 監聽 UserAgent
  playRemoteAudio: () => void; // 播放遠端音頻
  stopRemoteAudio: () => void; // 停止遠端音頻
  playRemoteVideo: () => void; // 播放遠端視頻
  stopRemoteVideo: () => void; // 停止遠端視頻
  playLocalVideo: () => Promise<void>; // 播放本地視頻
  stopLocalVideo: () => void; // 停止本地視頻
  toggleVideo: (streamSwitch: boolean) => Promise<void>; // 切換視頻
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>; // 遠端音頻引用
  localVideoRef: React.RefObject<HTMLVideoElement | null>; // 本地視頻引用
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>; // 遠端視頻引用
  dtmfAudioRef: React.RefObject<HTMLAudioElement | null>; // DTMF 音頻引用
  ringbackAudioRef: React.RefObject<HTMLAudioElement | null>; // 回鈴音音頻引用
  ringtoneAudioRef: React.RefObject<HTMLAudioElement | null>; // 鈴聲音頻引用
}

// 創建一個 Context，提供預設值
const SipCodeContext = createContext<SipCodeContextType>({
  initUserAgent: () => {},
  startUserAgent: async () => {},
  stopUserAgent: async () => {},
  registerUserAgent: async () => {},
  unRegisterUserAgent: async () => {},
  makeCall: () => {},
  hangUpCall: async () => {},
  sendDtmf: () => {},
  answerCall: async () => {},
  delegateUserAgent: () => {},
  playRemoteAudio: () => {},
  stopRemoteAudio: () => {},
  playRemoteVideo: () => {},
  stopRemoteVideo: () => {},
  playLocalVideo: async () => {},
  stopLocalVideo: () => {},
  toggleVideo: async () => {},
  remoteAudioRef: { current: null as HTMLAudioElement | null },
  localVideoRef: { current: null as HTMLVideoElement | null }, 
  remoteVideoRef: { current: null as HTMLVideoElement | null },
  dtmfAudioRef: { current: null as HTMLAudioElement | null },
  ringbackAudioRef: { current: null as HTMLAudioElement | null },
  ringtoneAudioRef: { current: null as HTMLAudioElement | null }
});

// 創建一個 Provider 組件，提供 SIP 功能和狀態
export const SipCodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setSipState, setCallType, setCallState } = useCallStateStore(); // 使用 CallState store
  const { displayName, username, password, serverAddress: wsServer, sipDomain: domain } = useSettingsStore(); // 使用 Settings store

  const userAgentRef = useRef<UserAgent | null>(null); // 使用 useRef 來儲存 UserAgent 狀態
  const registererRef = useRef<Registerer | null>(null); // 使用 useRef 來儲存當前的 Registerer
  const inviterRef = useRef<Inviter | null>(null); // 使用 useRef 來儲存當前的 Inviter
  const invitationRef = useRef<Invitation | null>(null); // 使用 useRef 來儲存當前的 Invitation
  const remoteStreamRef = useRef<MediaStream | null>(null); // 使用 useRef 來儲存遠端媒體流

  const remoteAudioRef = useRef<HTMLAudioElement>(null); // 遠端音頻引用
  const localVideoRef = useRef<HTMLVideoElement>(null); // 本地視頻引用
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // 遠端視頻引用

  const domainList = domain.split(','); // 分割 SIP 域
  const uri = UserAgent.makeURI(`sip:${username}@${domainList[0]}`); // 創建 URI

  const dtmfAudioRef = useRef<HTMLAudioElement>(null); // DTMF 音頻引用
  const ringbackAudioRef = useRef<HTMLAudioElement>(null); // 回鈴音音頻引用
  const ringtoneAudioRef = useRef<HTMLAudioElement>(null); // 鈴聲音頻引用

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

  // 播放鈴音
  const playRingTone = useCallback(() => {
    if (ringtoneAudioRef.current) {
      ringtoneAudioRef.current.loop = true;
      ringtoneAudioRef.current.play().catch(error => console.error('Failed to play ringback tone:', error));
    }
  }, []);

  // 停止鈴音
  const stopRingkTone = useCallback(() => {
    if (ringtoneAudioRef.current) {
      ringtoneAudioRef.current.pause();
      ringtoneAudioRef.current.currentTime = 0;
    }
  }, []);
  

  // 播放遠端音頻
  const playRemoteAudio = useCallback(() => {
    if (remoteAudioRef.current && remoteStreamRef.current) {
      remoteAudioRef.current.srcObject = remoteStreamRef.current;
      remoteAudioRef.current.play().catch(error => console.error('Failed to play audio:', error));
    }
  }, []);

  // 停止遠端音頻
  const stopRemoteAudio = useCallback(() => {
    const remoteAudioElement = remoteAudioRef.current as HTMLAudioElement;
    if (remoteAudioElement && remoteAudioElement.srcObject) {
      const stream = remoteAudioElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        if (track.kind === 'Audio') {
          track.stop();
        }
      });
      remoteAudioElement.srcObject = null;
    }
  }, []);

  // 播放遠端視頻
  const playRemoteVideo = useCallback(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      remoteVideoRef.current?.play().catch(error => console.error('Failed to play video:', error));
    }
  }, []);

  // 停止遠端視頻
  const stopRemoteVideo = useCallback(() => {
    const remoteVideoElement = remoteVideoRef.current as HTMLVideoElement;
    if (remoteVideoElement && remoteVideoElement.srcObject) {
      const stream = remoteVideoElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        if (track.kind === 'video') {
          track.stop();
        }
      });
      remoteVideoElement.srcObject = null;
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

  // 停止本地視頻
  const stopLocalVideo = useCallback(() => {
    const localVideoElement = localVideoRef.current as HTMLVideoElement;
    if (localVideoElement && localVideoElement.srcObject) {
      const stream = localVideoElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        if (track.kind === 'video') {
          track.stop();
        }
      });
      localVideoElement.srcObject = null;
    }
  }, []);

  // 初始化 UserAgent
  const initUserAgent = useCallback(async () => {
    if (!uri || !wsServer) {
      return null;
    }
    
    try {
    // 初始化 UserAgent 時，添加 STUN/TURN 配置
    const ua = new UserAgent({
      uri,
      displayName,
      authorizationUsername: username,
      authorizationPassword: password,
      transportOptions: {
        server: wsServer,
      },
      sessionDescriptionHandlerFactoryOptions: {
        constraints: {
          audio: true,
          video: true,
        },
        peerConnectionOptions: {
          rtcConfiguration: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              {
                urls: "turn:turn.sbc.telesale.org:3478",
                username: "bonuc",
                credential: "bonuc"
              },
              {
                urls: "turns:turn.sbc.telesale.org:5349",
                username: "bonuc",
                credential: "bonuc"
              }
            ]
          }
        }
      }
    });
      userAgentRef.current = ua;

      // 啟動 UserAgent
      try {
        await ua.start();
        setSipState('Start');
      } catch (error) {
        console.error('Failed to start:', error);
        // setSipError('Failed to start');
      }

      // 註冊 UserAgent
      const registerer = new Registerer(ua);
      try {
        await registerer.register();
        setSipState('Registered');
      } catch (error) {
        console.error('Failed to register:', error);
        // setSipError('Failed to register');
      }

      // 監聽來電事件
      ua.delegate = {
        onInvite: (invitation: Invitation) => {
          console.warn('有人打來了:', invitation);
          setSipState('Incoming call');
          setCallType('Invitation');
          invitationRef.current = invitation;

          setCallState("Establishing");
          playRingTone();

          // 設置會話狀態變更的監聽器
          invitation.stateChange.addListener((state) => {
            switch (state) {
              case SessionState.Establishing:
                setCallState("Establishing");
                break;
              case SessionState.Established:
                { 
                  setCallState("Established");
                  stopRingkTone();
                  // 播放遠端音頻
                  const remoteStream = new MediaStream();
                  if (invitation.sessionDescriptionHandler) {
                    const peerConnection = (invitation.sessionDescriptionHandler as unknown as { peerConnection: RTCPeerConnection }).peerConnection;
                    peerConnection.getReceivers().forEach((receiver: { track: MediaStreamTrack; }) => {
                      if (receiver.track) {
                        remoteStream.addTrack(receiver.track);
                      }
                    });

                    // 先阻斷本地視訊流傳送 直到進到 video 組件再打開
                    const localStream = peerConnection.getSenders().find((sender: RTCRtpSender) => sender.track?.kind === 'video')?.track;
                    if (!localStream) {
                      console.error('In Established, No local video stream found');
                      // setSipError('In Established, No local video stream found');
                      return;
                    }
                    localStream.enabled = false;

                    if(!remoteAudioRef.current) {
                      console.error('No remote audio element found');
                      // setSipError('No remote audio element found');
                      return;
                    }
                    remoteAudioRef.current.srcObject = remoteStream;
                    remoteAudioRef.current.play().catch(error => console.error('Failed to play audio:', error));
                    remoteStreamRef.current = remoteStream;
                  }
                  break; 
                }
              case SessionState.Terminated:
                setCallState("Terminated");
                stopRingkTone();
                setTimeout(() => {
                  setCallType(null);
                  setCallState(null);
                }, 1500);
                stopRemoteAudio();
                break;
              default:
                break;
            }
          });
      }};
    } catch (error) {
      console.error('Failed to create UserAgent:', error);
      return null;
    }
  }, [uri, wsServer, displayName, username, password, setSipState, setCallType, setCallState, playRingTone, stopRingkTone, stopRemoteAudio]);

  // 啟動 UserAgent
  const startUserAgent = useCallback(async () => {
    if (!userAgentRef.current) {
      console.error('UserAgent not initialized');
      // setSipError('UserAgent not initialized');
      return;
    }

    try {
      await userAgentRef.current.start();
      setSipState('UserAgent started');
    } catch (error) {
      console.error('Failed to start UserAgent:', error);
      // setSipError('Failed to start UserAgent');
    }
  }, [setSipState]);

  // 停止 UserAgent
  const stopUserAgent = useCallback(async () => {
    if (!userAgentRef.current) {
      console.error('UserAgent not initialized');
      // setSipError('UserAgent not initialized');
      return;
    }
    try {
      await userAgentRef.current.stop();
      setSipState('UserAgent stopped');
    } catch (error) {
      console.error('Failed to stop UserAgent:', error);
      // setSipError('Failed to stop UserAgent');
    }
  }, [setSipState]);

  // 註冊 UserAgent
  const registerUserAgent = useCallback(async () => {
    if (!userAgentRef.current) {
      console.error('UserAgent not initialized');
      // setSipError('UserAgent not initialized');
      return;
    }

    try {
      const registerer = new Registerer(userAgentRef.current);
      await registerer.register();
      registererRef.current = registerer;
      setSipState('UserAgent registered');
    } catch (error) {
      console.error('Failed to register UserAgent:', error);
      // setSipError('Failed to register UserAgent');
    }
  }, [setSipState]);

  // 解除註冊 UserAgent
  const unRegisterUserAgent = useCallback(async () => {
    if (!registererRef.current) {
      console.error('UserAgent not register');
      // setSipError('UserAgent not register');
      return;
    }

    try {
      await registererRef.current.unregister();
      setSipState('UserAgent unregistered');
    } catch (error) {
      console.error('Failed to unregistered UserAgent:', error);
      // setSipError('Failed to unregistered UserAgent');
    }
  }, [setSipState]);

  // 監聽 UserAgent
  const delegateUserAgent = <T extends keyof UserAgentDelegate>(
    eventType: T,
    toDoFn: UserAgentDelegate[T]
  ) => {
    // 檢查 userAgentState 是否已經初始化
    if (!userAgentRef.current) {
      console.error('UserAgent not initialized');
      // setSipError('UserAgent not initialized');
      return;
    }
  
    // 確保 userAgentState.delegate 已經被初始化
    if (!userAgentRef.current.delegate) {
      userAgentRef.current.delegate = {};
    }
  
    // 設置新的事件處理器
    userAgentRef.current.delegate[eventType] = ((...args: unknown[]) => {
      (toDoFn as (...args: unknown[]) => void)(...args);
    }) as UserAgentDelegate[T];
  };

  // 發起通話
  const makeCall = useCallback(async (phoneNumber: string) => {
    if (!userAgentRef.current) {
      console.error('UserAgent not initialized');
      // setSipError('UserAgent not initialized');
      return;
    }

    const targetURI = UserAgent.makeURI(`sip:${phoneNumber}@${domainList[0]}`);
    if (!targetURI || !userAgentRef.current) {
      console.error('Invalid target URI or UserAgent not initialized');
      setSipState('Invalid target URI or UserAgent not initialized');
      return;
    }
    const inviter = new Inviter(userAgentRef.current, targetURI, {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: true,
        },
      },
    });
    
    // 處理會話狀態變更
    inviter.stateChange.addListener((state) => {
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
              remoteStreamRef.current = remoteStream;

              // 先阻斷本地視訊流傳送 直到進到 video 組件再打開
              const localStream = peerConnection.getSenders().find((sender: RTCRtpSender) => sender.track?.kind === 'video')?.track;
              if (!localStream) {
                console.error('In Established, No local video stream found');
                // setSipError('In Established, No local video stream found');
                return;
              }
              localStream.enabled = false;
              

              // 播放遠端音頻
              if (!remoteAudioRef.current) {
                console.error('No remote audio element found');
                return;
              }
              remoteAudioRef.current.srcObject = remoteStream;
              remoteAudioRef.current.play().catch(error => console.error('Failed to play audio:', error));

              // 播放遠端視頻
              if (!remoteVideoRef.current) {
                console.error('No remote video element found');
                return;
              }
              remoteVideoRef.current.srcObject = remoteStream;
              remoteVideoRef.current?.play().catch(error => console.error('Failed to play video:', error));
            }
          }
          break;
        }
        case SessionState.Terminated:
          setCallState("Terminated");
          stopRingbackTone();
          stopRemoteAudio();
          stopRemoteVideo();
          setTimeout(() => {
            setCallType(null);
            setCallState(null);
          }, 1500);
          inviterRef.current = null;
          break;
        default:
          break;
      }
    });
    try {
      await inviter.invite();
      inviterRef.current = inviter;
    } catch (error) {
      console.error('Failed to make call:', error);
      // setSipError('Failed to make call');
    }
  }, [domainList, setSipState, setCallState, stopRingbackTone, stopRemoteAudio, stopRemoteVideo, playRingbackTone, setCallType]);

  // 接聽來電
  const answerCall = useCallback(async () => {
    if (!invitationRef.current) {
      console.error('Invitation not initialized');
      // setSipError('Invitation not initialized');
      return;
    }

    const invitationAcceptOptions: InvitationAcceptOptions = {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: true,
        },
      },
    }

    try {
      await invitationRef.current.accept(invitationAcceptOptions);
    }
    catch (error) {
      console.error('Failed to accept call:', error);
      // setSipError('Failed to accept call');
    }
  }, []);

  // 結束通話
  const hangUpCall = useCallback(async () => {
    if (inviterRef.current) {
      // 處理由你發起的通話
      if (inviterRef.current.state === SessionState.Established) {
        try {
          await inviterRef.current.bye();
          setSipState("Call ended");
        } catch (error) {
          console.error('Failed to end call:', error);
          // setSipError('Failed to end call');
        }

      } else {
        try {
          await inviterRef.current.cancel();
          setSipState("Call canceled");
        } catch (error) {
          console.error('Failed to cancel call:', error);
          // setSipError('Failed to cancel call');
        }
      }
      inviterRef.current = null;
    } else if (invitationRef.current) {
      // 處理來電
      if (invitationRef.current.state === SessionState.Established) {
        try {
          await invitationRef.current.bye();
          setSipState("Call ended");
        } catch (error) {
          console.error('Failed to end call:', error);
          // setSipError('Failed to end call');
        }
      } else {
        try {
          await invitationRef.current.reject();
          setSipState("Call canceled");
        } catch (error) {
          console.error('Failed to cancel call:', error);
          // setSipError('Failed to cancel call');
        }
      }
      invitationRef.current = null;
    } else {
      console.error('No active call to hang up or cancel');
      setSipState('No active call to hang up or cancel');
    }
  }, [setSipState]);

  // 發送 DTMF 音
  const sendDtmf = useCallback((digit: string) => {
    playDtmfSound();
    if (inviterRef.current && inviterRef.current.state === SessionState.Established) {
      const sessionDescriptionHandler = inviterRef.current.sessionDescriptionHandler;
      if (sessionDescriptionHandler) {
        sessionDescriptionHandler.sendDtmf(digit);
      }
    }
  }, [playDtmfSound]);

  // 切換視訊是否傳送給對方
  const toggleVideo = useCallback(async (streamSwitch: boolean) => {
    // 判斷是誰發起的通話
    const currentInviteRef = inviterRef.current || invitationRef.current;

    if (currentInviteRef && currentInviteRef.sessionDescriptionHandler) {
      const peerConnection = (currentInviteRef.sessionDescriptionHandler as unknown as { peerConnection: RTCPeerConnection }).peerConnection;
      const localStream = peerConnection.getSenders().find((sender: RTCRtpSender) => sender.track?.kind === 'video')?.track;
      
      if (!localStream) {
        console.error('No local video stream found');
        // setSipError('No local video stream found');
        return;
      }

      if (streamSwitch) {
        localStream.enabled = true;
      } else {
        localStream.enabled = false;
      }
    }
  }, []);

  // 提供 SIP 功能和狀態給子組件
  return (
    <SipCodeContext.Provider value={{
      initUserAgent,
      startUserAgent,
      stopUserAgent,
      registerUserAgent,
      unRegisterUserAgent,
      makeCall,
      hangUpCall,
      sendDtmf,
      answerCall,
      delegateUserAgent,
      playRemoteAudio,
      stopRemoteAudio,
      playRemoteVideo,
      stopRemoteVideo,
      playLocalVideo,
      stopLocalVideo,
      toggleVideo,
      remoteAudioRef,
      localVideoRef,
      remoteVideoRef,
      dtmfAudioRef,
      ringbackAudioRef,
      ringtoneAudioRef
    }}>
      {children}
    </SipCodeContext.Provider>
  );
};

export default SipCodeContext;
