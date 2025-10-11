import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Phone } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const role = searchParams.get('role') || 'member';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Let the backend handle authorization validation
    // No need for frontend hardcoded phone number validation

    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with phone:', phoneNumber.trim());
      console.log('API URL:', process.env.REACT_APP_API_URL);
      
      await login({ phone_number: phoneNumber.trim() });
      console.log('Login successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error details:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.message?.includes('Network Error')) {
        setError('Network connection failed. Please check your connection and try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/[^\d]/g, '');
    
    // Limit to 10 digits
    if (cleaned.length > 10) {
      return cleaned.substring(0, 10);
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <Phone sx={{ mr: 1, fontSize: 40, color: 'primary.main' }} />
            <Typography component="h1" variant="h4">
              {role === 'admin' ? 'Admin' : 'Member'} Login
            </Typography>
          </Box>

          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Enter your phone number to access your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Phone Number"
              name="phone"
              autoComplete="tel"
              autoFocus
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="9823786415"
              helperText={
                role === 'admin' 
                  ? "Admin access: Enter your authorized 10-digit number" 
                  : "Member access: Enter your authorized 10-digit number"
              }
              inputProps={{
                maxLength: 10,
                pattern: "[0-9]{10}"
              }}
              InputProps={{
                startAdornment: <Phone color="action" sx={{ mr: 1 }} />,
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading || !phoneNumber.trim()}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              New to the platform? Your account will be created automatically.
            </Typography>
            <Button
              variant="text"
              onClick={() => navigate('/')}
              sx={{ mt: 1 }}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;