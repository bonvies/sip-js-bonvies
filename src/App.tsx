import { Container, Stack } from '@mui/material';
import { useContext, useState } from 'react';
import Dialer from "./Pages/Dialer";
import Calls from "./Pages/Calls";
import Settings from "./Pages/Settings";
import dtnf from './assets/dtmf.mp3';
import ringbacktone from './assets/ringbacktone.mp3';
import ringtone from './assets/ringtone.mp3';
import SipCodeContext from './providers/SipCodeProvider';

import asusLogo from '../public/ASUS-IoT_logo.jpg';
import bonviesLogo from '../public/Bonvies_Logo.png';

export default function App() {
  const [tabValue] = useState(0);

  const sipContext = useContext(SipCodeContext);
  const { 
    remoteAudioRef,
    dtmfAudioRef,
    ringbackAudioRef,
    ringtoneAudioRef
  } = sipContext || {};

  // const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
  //   setTabValue(newValue);
  // };

  return (
    <Container sx={{ display: "flex", justifyContent: 'center', flexDirection: "column", height: "100%" }}>
      <Container sx={{ mt: 2, height:"40px", width: '200px' }}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <img src={asusLogo} alt="ASUS Logo" style={{ maxWidth: '100%', height: 'auto' }} />
          <p style={{fontSize: '16px'}}>X</p>
          <img src={bonviesLogo} alt="Bonvies Logo" style={{ maxWidth: '50%', height: 'auto' }} />
        </Stack>
      </Container>
      <Container maxWidth="xs">
        {/* <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="Dialer" />
          <Tab label="Calls" />
          <Tab label="Settings" />
        </Tabs> */}
      </Container>
      <Container sx={{ position: 'relative' }}>
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