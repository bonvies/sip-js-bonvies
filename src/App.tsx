import { Container, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import Dialer from "./Pages/Dialer";
import Calls from "./Pages/Calls";
import Settings from "./Pages/Settings";

export default function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xs" sx={{ height: '100%'}}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
      >
        <Tab label="Dialer" />
        <Tab label="Calls" />
        <Tab label="Settings" />
      </Tabs>
      {tabValue === 0 && <Dialer />}
      {tabValue === 1 && <Calls />}
      {tabValue === 2 && <Settings />}
    </Container>
  );
}