import { Container, Tabs, Tab } from '@mui/material';
import { useContext, useState } from 'react';
import Dialer from "./Pages/Dialer";
import Calls from "./Pages/Calls";
import Settings from "./Pages/Settings";
import dtnf from './assets/dtmf.mp3';
import ringbacktone from './assets/ringbacktone.mp3';
import SipCodeContext from './providers/SipCodeProvider';

export default function App() {
  const [tabValue, setTabValue] = useState(0);

  const sipContext = useContext(SipCodeContext);
  const { 
    remoteAudioRef,
    dtmfAudioRef,
    ringbackAudioRef,
  } = sipContext || {};

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xs" sx={{ height: '100%'}}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
      >
        <Tab label="Dialer" />
        <Tab label="Calls" />
        <Tab label="Settings" />
      </Tabs>
      {tabValue === 0 && <Dialer />}
      {tabValue === 1 && <Calls />}
      {tabValue === 2 && <Settings />}
      <audio ref={remoteAudioRef} autoPlay />
      <audio ref={dtmfAudioRef} src={dtnf} />
      <audio ref={ringbackAudioRef} src={ringbacktone} />
    </Container>
  );
}