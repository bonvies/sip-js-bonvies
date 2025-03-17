import { Container, Tabs, Tab, Alert } from '@mui/material';
import { useContext, useState } from 'react';
import Dialer from "./Pages/Dialer";
import Calls from "./Pages/Calls";
import Settings from "./Pages/Settings";
import dtnf from './assets/dtmf.mp3';
import ringbacktone from './assets/ringbacktone.mp3';
import ringtone from './assets/ringtone.mp3';
import SipCodeContext from './providers/SipCodeProvider';

export default function App() {
  const [tabValue, setTabValue] = useState(0);

  const sipContext = useContext(SipCodeContext);
  const { 
    remoteAudioRef,
    dtmfAudioRef,
    ringbackAudioRef,
    ringtoneAudioRef
  } = sipContext || {};

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Alert severity="info">TEST-04 : UserAgent 添加 Google Stun 和 turn 和 強制使用中繼 iceTransportPolicy:relay 設定</Alert>
      <Container maxWidth="xs">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="Dialer" />
          <Tab label="Calls" />
          <Tab label="Settings" />
        </Tabs>
      </Container>
      <Container sx={{ display: "flex", flexGrow: 1, position: 'relative' }}>
        {tabValue === 0 && <Dialer />}
        {tabValue === 1 && <Calls />}
        {tabValue === 2 && <Settings />}
        <audio ref={remoteAudioRef} autoPlay />
        <audio ref={dtmfAudioRef} src={dtnf} />
        <audio ref={ringbackAudioRef} src={ringbacktone} />
        <audio ref={ringtoneAudioRef} src={ringtone}/>
      </Container>
    </Container>

  );
}