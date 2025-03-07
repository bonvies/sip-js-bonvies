import { useContext, useEffect, useMemo, useState } from 'react';
import { Container, Grid2 as Grid, Button, Typography, Stack, Divider } from '@mui/material';
import SipCodeContext  from '../providers/SipCodeProvider';
import { useCallStateStore } from '../stores/CallState';

import Video from '../components/Video';

export default function Dialer() {
  const [callNumber, setCallNumber] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  
  const sipContext = useContext(SipCodeContext);
  const { 
    initUserAgent,
    stopUserAgent,
    makeCall,
    sendDtmf,
    answerCall,
    hangUpCall
  } = sipContext || {};
  const { callType, callState, setCallType } = useCallStateStore();

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
      makeCall(phoneNumber);
    }
    if (callNumber) {
      makeCall(callNumber);
    }
    setCallType('Inviter');
  };

  const handleHangUpCall = () => {
    hangUpCall();
    setCallNumber('');
  };

  const handleAnswerCall = () => {
    answerCall();
    setCallType('Invitation');
  };

  const handleToggleShowVideo = () => {
    setShowVideo((prev) => !prev);
  }

  const showCallState = useMemo(() => {
    if(callType === 'Inviter') {
      switch (callState) {
        case 'Establishing':
          return '撥號中';
        case 'Established':
          return '通話中';
        case 'Terminated':
          return '通話結束';
        default:
          return '';
      }
    }

    if(callType === 'Invitation') {
      switch (callState) {
        case 'Establishing':
          return '來電中';
        case 'Established':
          return '通話中';
        case 'Terminated':
          return '通話結束';
        default:
          return '';
      }
    }
  }, [callState, callType]);

  // 初始化 UserAgent 並在組件卸載時停止 UserAgent
  useEffect(() => {
    initUserAgent();
    return () => {
      stopUserAgent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {!showVideo
        ? (
        <Container maxWidth="xs" sx={{ mt: 4 }}>
          <Typography variant="h4" align="center" sx={{ mb: 2 }}>
            {callNumber ? callNumber : '請輸入撥打號碼'}
          </Typography>
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
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
          {!callState &&
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
          }
          {callState &&
            <Stack direction="row" spacing={1} sx={{ my: 2 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleHangUpCall}
                sx={{ my: 2 }}
              >
                Hang Up
              </Button>
              {(callType === 'Invitation' && callState === 'Establishing') &&
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleAnswerCall}
                  sx={{ my: 2 }}
                >
                  Answer
                </Button> 
              }
              {callState === 'Established' && 
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleToggleShowVideo}
                  sx={{ my: 2 }}
                >
                  Video
                </Button>
              }
            </Stack>
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
        ): <Video onToggleShowVideo={handleToggleShowVideo} onHandleHangUpCall={handleHangUpCall} />
      }
      
    </>

  );
}