import { useState } from 'react';
import { Container, Grid2 as Grid, Button, Typography, Stack } from '@mui/material';
import useSip from '../hooks/useSip';

export default function Dialer() {
  const [callNumber, setCallNumber] = useState('');
  const { startUserAgent, makeCall } = useSip();

  // 初始化 UserAgent


  const handleButtonClick = (value: string) => {
    setCallNumber((prev) => prev + value);
  };

  const handleClear = () => {
    setCallNumber('');
  };

  const handleFix = () => {
    setCallNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    console.log('Call:', callNumber);

    if (callNumber) {
      startUserAgent();
      console.log('Call:', callNumber);
      makeCall(callNumber);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" sx={{ mb: 2 }}>
        {callNumber ? callNumber : '請輸入撥打號碼'}
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
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
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
    </Container>
  );
}