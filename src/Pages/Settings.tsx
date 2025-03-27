import React, { useState, useEffect } from 'react';
import { Container, TextField, Typography, IconButton, InputAdornment, Button, Stack } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useSettingsStore } from '../stores/SipSetting';

export default function Settings() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    displayName,
    sipDomain,
    serverAddress,
    username,
    password,
    setDisplayName,
    setSipDomain,
    setServerAddress,
    setUsername,
    setPassword,
  } = useSettingsStore();

  const [localValues, setLocalValues] = useState({
    displayName,
    sipDomain,
    serverAddress,
    username,
    password,
  });

  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    const hasChanged =
      localValues.displayName !== displayName ||
      localValues.sipDomain !== sipDomain ||
      localValues.serverAddress !== serverAddress ||
      localValues.username !== username ||
      localValues.password !== password;

    setIsChanged(hasChanged);
  }, [localValues, displayName, sipDomain, serverAddress, username, password]);

  const handleChange = (prop: keyof typeof localValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValues({ ...localValues, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSave = () => {
    setDisplayName(localValues.displayName);
    setSipDomain(localValues.sipDomain);
    setServerAddress(localValues.serverAddress);
    setUsername(localValues.username);
    setPassword(localValues.password);

    // Save to localStorage
    localStorage.setItem('displayName', localValues.displayName);
    localStorage.setItem('sipDomain', localValues.sipDomain);
    localStorage.setItem('serverAddress', localValues.serverAddress);
    localStorage.setItem('username', localValues.username);
    localStorage.setItem('password', localValues.password);

    alert('Settings saved!');
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h6" gutterBottom>
        SIP Display Name (Optional)
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        label="Display Name"
        value={localValues.displayName}
        onChange={handleChange('displayName')}
        sx={{ mb: 2 }}
      />
      <Typography variant="h6" gutterBottom>
        SIP Domain
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        label="Domain"
        value={localValues.sipDomain}
        onChange={handleChange('sipDomain')}
        sx={{ mb: 2 }}
      />
      <Typography variant="h6" gutterBottom>
        Server Address
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        label="wss://example.com"
        value={localValues.serverAddress}
        onChange={handleChange('serverAddress')}
        sx={{ mb: 2 }}
      />
      <Typography variant="h6" gutterBottom>
        SIP Username
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        label="Username"
        value={localValues.username}
        onChange={handleChange('username')}
        sx={{ mb: 2 }}
      />
      <Typography variant="h6" gutterBottom>
        SIP Password
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={localValues.password}
        onChange={handleChange('password')}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSave} disabled={!isChanged}>
          Save
        </Button>
      </Stack>
    </Container>
  );
}