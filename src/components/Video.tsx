import { useContext } from 'react';
import { Container } from '@mui/material';
import SipCodeContext from '../providers/SipCodeProvider';

export default function Video() {
  const sipContext = useContext(SipCodeContext);
  const { 
    localVideoRef,
    remoteVideoRef,
  } = sipContext || {};

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <video id="localVideo" ref={localVideoRef} width='100%' autoPlay playsInline muted></video>
      <video id="remoteVideo" ref={remoteVideoRef} width='100%' autoPlay playsInline></video>
    </Container>
  );
}