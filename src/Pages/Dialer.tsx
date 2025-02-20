import { useMemo, useState } from 'react';
import { Container, Grid2 as Grid, Button, Typography, Stack, Divider } from '@mui/material';
import useSip from '../hooks/useSip';
import { useCallStateStore } from '../stores/CallState';

export default function Dialer() {
  const [callNumber, setCallNumber] = useState('');
  const { startUserAgent, makeCall, audioRef, hangUpCall } = useSip();
   const { callState } = useCallStateStore();

  const handleButtonClick = (value: string) => {
    setCallNumber((prev) => prev + value);
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
  },[callNumber, callState]);

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
              onClick={() => handleButtonClick(item)}
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
          hangUpCall
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
    </Container>
  );
}