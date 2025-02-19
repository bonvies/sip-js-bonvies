import { useState, useCallback } from 'react';
import { UserAgent, Inviter } from 'sip.js';
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

  const domainList = domain.split(','); // 分割域名
  const uri = UserAgent.makeURI(`sip:${username}@${domainList[0]}`); // 創建 SIP URI

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

  const makeCall = useCallback((phoneNumber: string) => {
    if (!userAgentState) {
      console.error('UserAgent not initialized');
      setCallState('UserAgent not initialized');
      return;
    }
    const targetURI = UserAgent.makeURI(`sip:${phoneNumber}@${domainList[0]}`);
    if (!targetURI) {
      console.error('Invalid target URI');
      return;
    }

    const inviter = new Inviter(userAgentState, targetURI);
    inviter.invite().then(() => {
      setCallState(`Calling ${phoneNumber}`);
    }).catch((error) => {
      console.error('Failed to make call:', error);
      setCallState('Failed to make call');
    });
  }, [userAgentState, domainList, setCallState]);

  return {
    initUserAgent,
    startUserAgent,
    stopUserAgent,
    makeCall,
  };
}