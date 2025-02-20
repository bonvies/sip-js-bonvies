import { useEffect, useState, useCallback } from 'react';
import { UserAgent, Inviter, SessionState } from 'sip.js';
import { useSettingsStore } from '../stores/SipSetting';
import { useCallStateStore } from '../stores/CallState';

export default function useSip() {
  const {
    setCallState,
  } = useCallStateStore();

  const {
    displayName,
    username,
    password,
    serverAddress: wsServer,
    sipDomain: domain,
  } = useSettingsStore();

  const [userAgentState, setUserAgentState] = useState<UserAgent | null>(null); // UserAgent 狀態
  const [currentInviter, setCurrentInviter] = useState<Inviter | null>(null); // Inviter 狀態

  const domainList = domain.split(','); // 分割域名
  const uri = UserAgent.makeURI(`sip:${username}@${domainList[0]}`); // 創建 SIP URI

  const initUserAgent = useCallback(() => {
    console.log('Init UserAgent');
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
      console.log('UserAgent created:', ua);
      setUserAgentState(ua);
    } catch (error) {
      console.error('Failed to create UserAgent:', error);
      return null;
    }
  },[uri, wsServer, displayName, username, password]);

  const startUserAgent = useCallback(async () => {
    if (!userAgentState) {
      console.error('UserAgent not initialized');
      setCallState('UserAgent not initialized');
      return;
    }
    try {
      await userAgentState.start();
      setCallState('UserAgent started');
    } catch (error) {
      console.error('Failed to start UserAgent:', error);
      setCallState('Failed to start UserAgent');
    }
  }, [userAgentState, setCallState]);

  const stopUserAgent = useCallback(async () => {
    if (!userAgentState) {
      console.error('UserAgent not initialized');
      setCallState('UserAgent not initialized');
      return;
    }
    try {
      await userAgentState.stop();
      setCallState('UserAgent stopped');
    } catch (error) {
      console.error('Failed to stop UserAgent:', error);
      setCallState('Failed to stop UserAgent');
    }
  }, [userAgentState, setCallState]);

  const handleSessionStateChange = useCallback((state: SessionState) => {
    switch (state) {
      case SessionState.Establishing: {
        setCallState("Establishing");
        break;
      }
      case SessionState.Established: {
        setCallState("Established");
        
        const remoteStream = new MediaStream();
        if (currentInviter?.sessionDescriptionHandler) {
          (currentInviter.sessionDescriptionHandler as unknown as { peerConnection: RTCPeerConnection }).peerConnection.getReceivers().forEach((receiver: { track: MediaStreamTrack; }) => {
            if (receiver.track) {
              remoteStream.addTrack(receiver.track);
            }
          });
        }
        break;
      }
      case SessionState.Terminated:
        setCallState("Terminated");
        setTimeout(() => {
          setCallState('');
        }, 1500);
        setCurrentInviter(null);
        break;
      default:
        break;
    }
  }, [currentInviter, setCallState]);

  const initInviter = useCallback(async (phoneNumber: string) => {
    const targetURI = UserAgent.makeURI(`sip:${phoneNumber}@${domainList[0]}`);
    if (!targetURI || !userAgentState) {
      console.error('Invalid target URI or UserAgent not initialized');
      setCallState('Invalid target URI or UserAgent not initialized');
      return;
    }
    const inviter = new Inviter(userAgentState, targetURI);
    inviter.stateChange.addListener((state) => handleSessionStateChange(state));
    try {
      await inviter.invite();
      setCallState(`Calling`);
      setCurrentInviter(inviter);
    } catch (error) {
      console.error('Failed to make call:', error);
      setCallState('Failed to make call');
    }
  }, [domainList, setCallState, userAgentState, handleSessionStateChange]);

  const makeCall = useCallback((phoneNumber: string) => {
    if (!userAgentState) {
      console.error('UserAgent not initialized');
      setCallState('UserAgent not initialized');
      return;
    }

    initInviter(phoneNumber);
  }, [userAgentState, initInviter, setCallState]);

  const hangUpCall = useCallback(() => {
    if (currentInviter) {
      currentInviter.bye().then(() => {
        setCallState('Call ended');
        setCurrentInviter(null); // 清除 inviter 實例
      }).catch((error) => {
        console.error('Failed to end call:', error);
        setCallState('Failed to end call');
      });
    }
  }, [currentInviter, setCallState]);

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
    hangUpCall
  };
}