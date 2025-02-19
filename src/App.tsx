import { Container, Tabs, Tab } from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function App() {
  const location = useLocation();
  const [tabValue, setTabValue] = useState(location.pathname);

  useEffect(() => {
    setTabValue(location.pathname);
  }, [location.pathname]);

  return (
    <Container maxWidth="xs" sx={{ height: '100%'}}>
      <Tabs
        value={tabValue}
        variant="fullWidth"
      >
        <Tab label="Dialer" component={Link} to="/" value="/" />
        <Tab label="Calls" component={Link} to="/calls" value="/calls" />
        <Tab label="Settings" component={Link} to="/settings" value="/settings" />
      </Tabs>
      <Outlet />
    </Container>
  );
}