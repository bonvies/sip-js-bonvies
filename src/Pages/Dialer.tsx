import { useEffect, useMemo, useState } from 'react';
import { Container, Grid2 as Grid, Button, Typography, Stack, Divider } from '@mui/material';
import useSip from '../hooks/useSip';
import { useCallStateStore } from '../stores/CallState';

import dtnf from '../assets/dtmf.mp3';
import ringbacktone from '../assets/ringbacktone.mp3';

export default function Dialer() {
  const [callNumber, setCallNumber] = useState('');
  const { audioRef, dtmfAudioRef, ringbackAudioRef, startUserAgent, makeCall, sendDtmf, hangUpCall } = useSip();
  const { callState } = useCallStateStore();

  const handleDialButtonClick = (value: string) => {
    if (!callState || callState === 'Established') {
      setCallNumber((prev) => prev + value);
      // 播送分機
      sendDtmf(value);
    }
  };

  const handleClear = () => {
    setCallNumber('');
  };

  const handleFix = () => {
    setCallNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = (_event: React.MouseEvent<HTMLButtonElement>, phoneNumber: string | null = null) => {
    if (phoneNumber) {
      startUserAgent();
      makeCall(phoneNumber);
    }
    if (callNumber) {
      startUserAgent();
      makeCall(callNumber);
    }
    setCallNumber('');
  };

  const handleHangUpCall = () => {
    hangUpCall();
    setCallNumber('');
  };

  const showCallState = useMemo(() => {
    switch (callState) {
      case 'Establishing':
        return '撥號中';
      case 'Established':
        return '通話中';
      case 'Terminated':
        return '通話結束';
      default:
        return callNumber ? callNumber : '請輸入撥打號碼';
    }
  }, [callNumber, callState]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(stream => {
        // 將本地視訊流設置到視訊元素中
        const localVideoElement = document.getElementById('localVideo') as HTMLVideoElement;
        if (localVideoElement) {
          localVideoElement.srcObject = stream;
          localVideoElement.play().catch(error => console.error('Failed to play local video:', error));
        }
      })
      .catch(error => console.error('Failed to get local media:', error));
  }, []);

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <audio ref={audioRef} autoPlay />
      <Typography variant="h4" align="center" sx={{ mb: 2 }}>
        {showCallState}
      </Typography>
      <Grid container spacing={1}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((item) => (
          <Grid key={item} size={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleDialButtonClick(item)}
              sx={{ height: 60 }}
            >
              {item}
            </Button>
          </Grid>
        ))}
      </Grid>
      {!callState ? 
        <Stack direction="row" spacing={1} sx={{ my: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleCall}
          >
            Call
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleFix}
          >
            Fix
          </Button>
        </Stack>
      :
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleHangUpCall}
          sx={{ my: 2 }}
        >
          Hang Up
        </Button>
      }
      <Divider>指定撥打對象</Divider>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={(e) => handleCall(e, '0915970815')}
        disabled={callState === 'Establishing' || callState === 'Established' || callState === 'Terminated'}
        sx={{ mt: 2 }}
      >
        Call Leo
      </Button>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={(e) => handleCall(e, '0902213273')}
        disabled={callState === 'Establishing' || callState === 'Established' || callState === 'Terminated'}
        sx={{ mt: 2 }}
      >
        Call Aya
      </Button>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={(e) => handleCall(e, '77505134')}
        disabled={callState === 'Establishing' || callState === 'Established' || callState === 'Terminated'}
        sx={{ mt: 2 }}
      >
        Call 智能客服中心
      </Button>
      <video id="localVideo" width='100%' autoPlay playsInline muted></video>
      <video id="remoteVideo" width='100%' autoPlay playsInline></video>
      <audio ref={dtmfAudioRef} src={dtnf} />
      <audio ref={ringbackAudioRef} src={ringbacktone} />
    </Container>
  );
}