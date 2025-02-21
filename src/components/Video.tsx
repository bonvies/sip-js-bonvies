import { useEffect } from 'react';
import { Container, Grid2 as Grid, Button, Typography, Stack, Divider } from '@mui/material';
import useSip from '../hooks/useSip';

export default function Video() {
  const { remoteAudioRef, localVideoRef, remoteVideoRef, dtmfAudioRef, ringbackAudioRef, startUserAgent, makeCall, sendDtmf, hangUpCall, playLocalVideo } = useSip();

  useEffect(() => {
    playLocalVideo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <video id="localVideo" ref={localVideoRef} width='100%' autoPlay playsInline muted></video>
      <video id="remoteVideo" ref={remoteVideoRef} width='100%' autoPlay playsInline></video>
    </Container>
  );
}