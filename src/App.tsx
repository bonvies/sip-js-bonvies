import { Container, Box } from '@mui/material';
import { useContext, useState } from 'react';
import Dialer from "./Pages/Dialer";
import Calls from "./Pages/Calls";
import Settings from "./Pages/Settings";
import dtnf from './assets/dtmf.mp3';
import ringbacktone from './assets/ringbacktone.mp3';
import ringtone from './assets/ringtone.mp3';
import SipCodeContext from './providers/SipCodeProvider';

import logo from '../public/ASUS-Iot X bonvies.png';

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
    <Container sx={{ display: "flex",  justifyContent: {xs: 'flex-start', sm:'center'}, flexDirection: "column", height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: 'center' }}>
        <img src={logo} alt="logo" style={{ width: '150px' }} />
      </Box>
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