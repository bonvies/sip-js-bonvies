import { useContext, useEffect, useState } from 'react';
import { Container, Button, Stack } from '@mui/material';
import SipCodeContext from '../providers/SipCodeProvider';

type VideoProps = {
  onToggleShowVideo: () => void;
}

export default function Video(props: VideoProps) {
  const sipContext = useContext(SipCodeContext);
  const [localVideoState, setLocalVideoState] = useState(false);

  const { 
    playLocalVideo,
    stopLocalVideo,
    playRemoteVideo,
    stopRemoteVideo,
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

  const handleToggleShowVideo = () => {
    props.onToggleShowVideo();
    stopLocalVideo();
  };

  useEffect(() => {
    toggleVideo(true); // 因為預設會在撥號成功後阻斷視訊流 所以先在這邊打開
    setLocalVideoState(true);
    playLocalVideo();
    playRemoteVideo();
  }, [playLocalVideo, playRemoteVideo, stopLocalVideo, stopRemoteVideo, toggleVideo]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <video id="localVideo" ref={localVideoRef} width='100%' autoPlay playsInline muted></video>
      <video id="remoteVideo" ref={remoteVideoRef} width='100%' autoPlay playsInline muted></video>
      <Stack direction="row" spacing={1} sx={{ my: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleToggleShowVideo}
          sx={{ my: 2 }}
        >
          回到撥號盤
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleVideoCall}
          sx={{ my: 2 }}
        >
          {!localVideoState ? '開啟視訊' : '關閉視訊'}
        </Button>
      </Stack>
    </Container>
  );
}