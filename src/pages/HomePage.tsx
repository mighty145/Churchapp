import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Fade,
} from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BibleVerse } from '../types';
import apiService from '../services/api';

const HomePage: React.FC = () => {
  const [bibleVerse, setBibleVerse] = useState<BibleVerse | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    // Fetch daily Bible verse
    const fetchBibleVerse = async () => {
      try {
        const verse = await apiService.getDailyBibleVerse();
        setBibleVerse(verse);
      } catch (error) {
        console.error('Error fetching Bible verse:', error);
        // Set fallback verse
        setBibleVerse({
          verse: "For where your treasure is, there your heart will be also.",
          reference: "Matthew 6:21",
          date: new Date().toISOString().split('T')[0]
        });
      }
    };

    fetchBibleVerse();
  }, [isAuthenticated, navigate]);

  // Member login functionality temporarily disabled
  // const handleMemberLogin = () => {
  //   navigate('/login?role=member');
  // };

  const handleAdminLogin = () => {
    navigate('/login?role=admin');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Fade in timeout={1000}>
          <Typography variant="h2" component="h1" gutterBottom color="primary">
            Methodist English Church, Kirkee
          </Typography>
        </Fade>

        <Fade in timeout={1500}>
          <Typography variant="h5" color="text.secondary" paragraph>
            Donation & Receipt Management Platform
          </Typography>
        </Fade>

        {/* Church Image */}
        <Fade in timeout={1750}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/Homepageimage.jpg" 
              alt="Methodist English Church, Kirkee" 
              style={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: '400px',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                objectFit: 'cover'
              }}
            />
          </Box>
        </Fade>

        {/* Bible Verse */}
        <Fade in timeout={2000}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: 2
            }}
          >
            {bibleVerse ? (
              <>
                <Typography variant="h6" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "{bibleVerse.verse}"
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {bibleVerse.reference}
                </Typography>
              </>
            ) : (
              <Typography variant="h6">Loading daily verse...</Typography>
            )}
          </Paper>
        </Fade>

        {/* Login Section */}
        <Fade in timeout={2500}>
          <Card elevation={3} sx={{ p: 4 }}>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Access Your Account
              </Typography>
              
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Member Login temporarily disabled */}
                {/* <Button
                  variant="contained"
                  size="large"
                  startIcon={<Phone />}
                  onClick={handleMemberLogin}
                  sx={{ py: 2, fontSize: '1.1rem' }}
                >
                  Member Login
                </Button> */}

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<AdminPanelSettings />}
                  onClick={handleAdminLogin}
                  sx={{ py: 2, fontSize: '1.1rem' }}
                >
                  Admin Login
                </Button>
              </Box>

              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 3 }}
              >
                Login with your phone number to access donation history and receipts.
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Container>
  );
};

export default HomePage;