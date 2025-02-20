import { useEffect, useState, useCallback, useRef } from 'react';
import { UserAgent, Inviter, SessionState } from 'sip.js';
import { useSettingsStore } from '../stores/SipSetting';
import { useCallStateStore } from '../stores/CallState';

export default function useSip() {
  // 從狀態管理中獲取設置和通話狀態的更新函數
  const { setSipState, setCallState, setSipError } = useCallStateStore();
  const { displayName, username, password, serverAddress: wsServer, sipDomain: domain } = useSettingsStore();

  // 狀態管理：UserAgent 和 Inviter
  const [userAgentState, setUserAgentState] = useState<UserAgent | null>(null); // 用於管理 SIP UserAgent 的狀態
  const [currentInviter, setCurrentInviter] = useState<Inviter | null>(null); // 用於管理當前的 Inviter 實例
  const audioRef = useRef<HTMLAudioElement | null>(null); // 用於管理音訊元素的 ref

  // 分割域名並創建 SIP URI
  const domainList = domain.split(','); // 將域名以逗號分割成陣列
  const uri = UserAgent.makeURI(`sip:${username}@${domainList[0]}`); // 使用第一個域名創建 SIP URI

  // 初始化 UserAgent
  const initUserAgent = useCallback(() => {
    if (!uri || !wsServer) {
      return null; // 如果 URI 或 WebSocket 伺服器地址不存在，則返回 null
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
      setUserAgentState(ua); // 設置 UserAgent 狀態
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
      await userAgentState.start(); // 啟動 UserAgent
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
      await userAgentState.stop(); // 停止 UserAgent
      setSipState('UserAgent stopped');
    } catch (error) {
      console.error('Failed to stop UserAgent:', error);
      setSipError('Failed to stop UserAgent');
    }
  }, [userAgentState, setSipError, setSipState]);

  // 處理會話狀態變更
  const handleSessionStateChange = useCallback((state: SessionState, inviter: Inviter) => {
    switch (state) {
      case SessionState.Establishing: {
        setCallState("Establishing"); // 設置通話狀態為正在建立
        break;
      }
      case SessionState.Established: {
        setCallState("Established"); // 設置通話狀態為已建立
        // 獲取並播放遠端音訊
        if (audioRef.current && inviter) {
          const remoteStream = new MediaStream();
          if (inviter.sessionDescriptionHandler) {
            (inviter.sessionDescriptionHandler as unknown as { peerConnection: RTCPeerConnection }).peerConnection.getReceivers().forEach((receiver: { track: MediaStreamTrack; }) => {
              if (receiver.track) {
                remoteStream.addTrack(receiver.track); // 將接收到的音訊軌道添加到音訊流中
              }
            });
          }
          audioRef.current.srcObject = remoteStream; // 將音訊流設置到音訊元素中
          audioRef.current.play().catch(error => console.error('Failed to play audio:', error)); // 播放音訊
        };
        break;
      }
      case SessionState.Terminated:
        setCallState("Terminated"); // 設置通話狀態為已終止
        setTimeout(() => {
          setCallState(null); // 清除通話狀態
        }, 1500);
        setCurrentInviter(null); // 清除當前的 Inviter 實例
        break;
      default:
        break;
    }
  }, [setCallState]);

  // 初始化 Inviter 並發起呼叫
  const initInviter = useCallback(async (phoneNumber: string) => {
    const targetURI = UserAgent.makeURI(`sip:${phoneNumber}@${domainList[0]}`); // 創建目標 SIP URI
    if (!targetURI || !userAgentState) {
      console.error('Invalid target URI or UserAgent not initialized');
      setSipState('Invalid target URI or UserAgent not initialized');
      return;
    }
    const inviter = new Inviter(userAgentState, targetURI); // 創建 Inviter 實例
    inviter.stateChange.addListener((state) => handleSessionStateChange(state, inviter)); // 添加狀態變更監聽器
    try {
      await inviter.invite(); // 發起呼叫
      setCurrentInviter(inviter); // 設置當前的 Inviter 實例
    } catch (error) {
      console.error('Failed to make call:', error);
      setSipError('Failed to make call');
    }
  }, [domainList, userAgentState, setSipState, handleSessionStateChange, setSipError]);

  // 發起呼叫
  const makeCall = useCallback((phoneNumber: string) => {
    if (!userAgentState) {
      console.error('UserAgent not initialized');
      setSipError('UserAgent not initialized');
      return;
    }

    initInviter(phoneNumber); // 初始化 Inviter 並發起呼叫
  }, [userAgentState, initInviter, setSipError]);

  // 掛斷或取消呼叫
  const hangUpCall = useCallback(async () => {
    if (currentInviter) {
      // 根據當前會話的狀態來決定取消或掛斷
      if (currentInviter.state === SessionState.Establishing) {
        // 如果呼叫正在建立，則取消呼叫
        try {
          await currentInviter.cancel()
          setSipState("Call canceled");
        } catch (error) {
          console.error('Failed to cancel call:', error);
          setSipError('Failed to cancel call');
        }
      } else {
        // 如果呼叫已建立，則掛斷通話
        try {
          await currentInviter.bye()
          setSipState("Call ended");
        } catch (error) {
          console.error('Failed to end call:', error);
          setSipError('Failed to end call');
        }
      }
      setCurrentInviter(null); // 清除當前的 Inviter 實例
    } else {
      setSipState('No active call to hang up or cancel');
    }
  }, [currentInviter, setSipError, setSipState]);

  // 發送 DTMF (處理分機選擇用的)
  const sendDtmf = useCallback((digit: string) => {
    if (currentInviter && currentInviter.state === SessionState.Established) {
      const sessionDescriptionHandler = currentInviter.sessionDescriptionHandler;
      if (sessionDescriptionHandler) {
        sessionDescriptionHandler.sendDtmf(digit);
      }
    }
  }, [currentInviter]);

  // 初始化 UserAgent 並在組件卸載時停止 UserAgent
  useEffect(() => {
    initUserAgent();
    return () => {
      stopUserAgent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    initUserAgent,
    startUserAgent,
    stopUserAgent,
    makeCall,
    hangUpCall,
    sendDtmf,
    audioRef,
  };
}