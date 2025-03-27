import { Container, Tabs, Tab, ThemeProvider } from '@mui/material';
import { useContext, useState } from 'react';
import Dialer from "./Pages/Dialer";
import Settings from "./Pages/Settings";
import dtnf from './assets/dtmf.mp3';
import ringbacktone from './assets/ringbacktone.mp3';
import ringtone from './assets/ringtone.mp3';
import SipCodeContext from './providers/SipCodeProvider';
import theme from './theme';

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
    <ThemeProvider theme={theme}>
      <Container sx={{ display: "flex", justifyContent: "center", flexDirection: "column", height: "100%" }}>
        <Container maxWidth="xs" sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab label="Dialer" />
            <Tab label="Settings" />
          </Tabs>
        </Container>
        <Container 
          sx={{
            display: "flex",
            height: { xs: "100%", sm: "auto" },
            position: 'relative' 
          }}
        >
          {tabValue === 0 && <Dialer />}
          {tabValue === 1 && <Settings />}
          <audio ref={remoteAudioRef} autoPlay />
          <audio ref={dtmfAudioRef} src={dtnf} />
          <audio ref={ringbackAudioRef} src={ringbacktone} />
          <audio ref={ringtoneAudioRef} src={ringtone}/>
        </Container>
      </Container>
    </ThemeProvider>
  );
}