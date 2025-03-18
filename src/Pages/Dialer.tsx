import { useContext, useEffect, useState } from 'react';
import { Container, Grid2 as Grid, Button, Typography, Stack, Divider } from '@mui/material';
import SipCodeContext  from '../providers/SipCodeProvider';
import ShowCallState from '../components/ShowCallState';
import { useCallStateStore } from '../stores/CallState';

import Video from '../components/Video';

// import asusLogo from '../../public/ASUS-IoT_logo.jpg';
// import bonviesLogo from '../../public/Bonvies_Logo.png';

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

  useEffect(() => {
    if(callState === 'Terminated') {
      setTimeout(() => {
        setShowVideo(false);
        setCallNumber('');
      }, 1000);
    }
  }, [callState]);

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
        <Container maxWidth="xs" sx={{ mt: 1 }}>
          <Typography variant="h4" align="center" sx={{ mb: 2 }}>
            {callNumber ? callNumber : '請輸入撥打號碼'}
          </Typography>
          <ShowCallState />
          <Grid container spacing={1}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((item) => (
              <Grid key={item} size={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleDialButtonClick(item)}
                  sx={{ height: 50 }}
                >
                  <p style={{fontSize:'28px'}}>{item}</p>
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
          {/* <Button
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
          </Button> */}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={(e) => handleCall(e, '3009')}
            disabled={callState === 'Establishing' || callState === 'Established' || callState === 'Terminated'}
            sx={{ mt: 2, py: 1.5 }}
          >
            Call 智能客服中心
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={(e) => handleCall(e, '3004')}
            disabled={callState === 'Establishing' || callState === 'Established' || callState === 'Terminated'}
            sx={{ mt: 2, py: 1.5 }}
          >
            Call 視訊服務影像專員
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={() => window.location.reload()}
            sx={{ mt: 2, py: 1.5 }}
          >
            重置系統
          </Button>
        </Container>
        ): <Video onToggleShowVideo={handleToggleShowVideo} onHandleHangUpCall={handleHangUpCall} />
      }
      
    </>

  );
}