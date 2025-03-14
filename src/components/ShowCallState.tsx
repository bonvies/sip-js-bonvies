import { Typography } from "@mui/material";
import { useMemo } from "react";
import { useCallStateStore } from '../stores/CallState';

export default function ShowCallState() {
  const { callType, callState } = useCallStateStore();

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
  return (
    <Typography variant="h6" align="center" sx={{ mb: 2 }}>
      {showCallState}
    </Typography>
  );
};