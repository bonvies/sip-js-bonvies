import { useCallback, useContext, useEffect, useState } from 'react';
import { Container, Button, Box, Stack, styled } from '@mui/material';
import SipCodeContext from '../providers/SipCodeProvider';
import ShowCallState from '../components/ShowCallState';

type VideoProps = {
  onToggleShowVideo: () => void;
  onHandleHangUpCall: () => void;
}

export default function Video(props: VideoProps) {
  const sipContext = useContext(SipCodeContext);
  const [localVideoState, setLocalVideoState] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

  const { 
    playLocalVideo,
    stopLocalVideo,
    playRemoteVideo,
    stopRemoteVideo,
    delegateUserAgent,
    localVideoRef,
    remoteVideoRef,
    toggleVideo
  } = sipContext || {};

  const handleVideoCall = () => {
    setLocalVideoState((prev) => {
      toggleVideo(!prev);
      if (!prev) {
        playLocalVideo();
      } else {
        stopLocalVideo();
      }
      return !prev;
    });
  };

  const handleToggleShowVideo = useCallback(() => {
    props.onToggleShowVideo();
    stopLocalVideo();
  }, [props, stopLocalVideo]);

  const handleHandleHangUpCall = () => {
    props.onHandleHangUpCall();
    setTimeout(() => {
      props.onToggleShowVideo();
    },1000);
    stopLocalVideo();
  };

  const handleSwapVideo = () => {
    setIsSwapped((prev) => !prev);
  };

  useEffect(() => {
    toggleVideo(true);
    setLocalVideoState(true);
    playLocalVideo();
    playRemoteVideo();
    return () => {
      toggleVideo(false);
      stopLocalVideo();
      stopRemoteVideo();
    }
  }, [delegateUserAgent, handleToggleShowVideo, playLocalVideo, playRemoteVideo, stopLocalVideo, stopRemoteVideo, toggleVideo]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, position: 'relative', display: 'flex', flexDirection: "column", overflow: 'hidden' }}>
      <ShowCallState />
      <Box 
        position='relative' 
        onClick={handleSwapVideo}
        sx={{
          height: {
            xs: '100%',
            sm: 'auto',
          }
        }}
      >
        <Box 
          sx={isSwapped ? {
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: '30%',
            height: 'auto',
            borderRadius: '8px',
            zIndex: 1,
          } : {
            position: 'relative',
            height: {
              xs: '100%',
              sm: 'auto',
            }
          }}
        >
          <CustomRemoteVideo
            id="remoteVideo"
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
          ></CustomRemoteVideo>
        </Box>
        <Box
          sx={isSwapped ? {
            position: 'relative',
            height: {
              xs: '100%',
              sm: 'auto',
            }
          } : {
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: '30%',
            height: 'auto',
            borderRadius: '8px',
            zIndex: 1,
          }}
        >
          <CustomLocalVideo
            id="localVideo"
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
          ></CustomLocalVideo>
        </Box>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        width="100%"
        sx={{ my: 2 }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleToggleShowVideo}
          sx={{ width: '100%' }}
        >
          回到撥號盤
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleHandleHangUpCall}
          sx={{ width: '100%' }}
        >
          Hang Up
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleVideoCall}
          sx={{ width: '100%' }}
        >
          {!localVideoState ? '開啟視訊' : '關閉視訊'}
        </Button>
      </Stack>
    </Container>
  );
}

const CustomRemoteVideo = styled('video')(() => ({
  width: '100%',
  height: '100%',
  backgroundColor: 'black',
  borderRadius: '8px',
  border: '3px solid #fff',
  objectFit: 'cover',
  aspectRatio: '16/9', // 設定固定的長寬比
}));

const CustomLocalVideo = styled('video')(() => ({
  width: '100%',
  height: '100%',
  backgroundColor: 'black',
  border: '3px solid #fff',
  borderRadius: '8px',
  objectFit: 'cover',
  aspectRatio: '16/9', // 設定固定的長寬比
}));