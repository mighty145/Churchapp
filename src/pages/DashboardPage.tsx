import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  CircularProgress,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { DashboardStats, CollectionStatistics } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import apiService from '../services/api';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [collectionStats, setCollectionStats] = useState<CollectionStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const { user, isAdmin } = useAuth();
  const { lastMessage, isConnected } = useWebSocket();

  // Initialize date range (current financial year by default)
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based (April = 3)
    
    // Calculate current financial year start year
    let fyStartYear;
    if (currentMonth >= 3) { // April (3) onwards - we're in the current FY
      fyStartYear = currentYear;
    } else { // January to March - we're in the previous FY
      fyStartYear = currentYear - 1;
    }
    
    // Create start date string directly (avoids timezone issues)
    const startDateString = `${fyStartYear}-04-01`; // April 1st of financial year
    const endDateString = today.toISOString().split('T')[0];
    
    setStartDate(startDateString);
    setEndDate(endDateString);
  }, []);

  // Helper function to get financial year
  const getFinancialYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based, so April = 3
    
    if (currentMonth >= 3) { // April (3) onwards
      return { startYear: currentYear, endYear: currentYear + 1 };
    } else { // January to March
      return { startYear: currentYear - 1, endYear: currentYear };
    }
  };

  const { startYear, endYear } = getFinancialYear();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const dashboardStats = await apiService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const fetchCollectionStatistics = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    try {
      setLoadingStats(true);
      const statistics = await apiService.getCollectionStatistics(startDate, endDate);
      setCollectionStats(statistics);
    } catch (error) {
      console.error('Error fetching collection statistics:', error);
      alert('Error fetching collection statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'collection_update') {
      console.log('Real-time collection update received');
      // Optionally refresh stats
    }
  }, [lastMessage]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name || user?.phone_number}!
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        {isAdmin ? 'Admin Dashboard' : 'Member Dashboard'} • 
        Connection: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </Typography>

      {/* Original Dashboard Stats */}
      {stats ? (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Financial Year (Apr-{startYear} to Mar-{endYear})
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Collections
                </Typography>
                <Typography variant="h4">
                  ₹{(stats.collections.total_collections_amount || stats.collections.total_expenditure).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Expenditure
                </Typography>
                <Typography variant="h4">
                  ₹0.00
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Receipts
                </Typography>
                <Typography variant="h4">
                  {stats.receipts.total_receipts}
                </Typography>
              </CardContent>
            </Card>


          </Box>
        </Box>
      ) : (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No dashboard data available
          </Typography>
        </Paper>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Collection Statistics by Date Range - Admin Only */}
      {isAdmin && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Collection Statistics by Date Range
          </Typography>

          {/* Date Range Picker */}
          <Paper sx={{ p: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ minWidth: 200, flex: 1 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ minWidth: 200, flex: 1 }}>
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ minWidth: 200, flex: 1 }}>
                <Button
                  variant="contained"
                  onClick={fetchCollectionStatistics}
                  disabled={loadingStats || !startDate || !endDate}
                  fullWidth
                  sx={{ height: 56 }}
                >
                  {loadingStats ? <CircularProgress size={24} /> : 'Get Statistics'}
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Collection Statistics Display */}
          {collectionStats && (
            <Box sx={{ mt: 3 }}>
              {/* Total Collection Overview */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
                <Box sx={{ minWidth: 250, flex: 1 }}>
                  <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Total Collection
                      </Typography>
                      <Typography variant="h4">
                        ₹{collectionStats.total_collection.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ minWidth: 250, flex: 1 }}>
                  <Card sx={{ height: '100%', bgcolor: 'success.main', color: 'success.contrastText' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Cash Collection
                      </Typography>
                      <Typography variant="h4">
                        ₹{collectionStats.cash_collection.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ minWidth: 250, flex: 1 }}>
                  <Card sx={{ height: '100%', bgcolor: 'info.main', color: 'info.contrastText' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Online Collection
                      </Typography>
                      <Typography variant="h4">
                        ₹{collectionStats.online_collection.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* General Contributions */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                General Contributions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Box sx={{ minWidth: 200, flex: 1 }}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>Tithe</Typography>
                      <Typography variant="h5">₹{collectionStats.general_contributions.tithe.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ minWidth: 200, flex: 1 }}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>Membership</Typography>
                      <Typography variant="h5">₹{collectionStats.general_contributions.membership.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ minWidth: 200, flex: 1 }}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>Birthday</Typography>
                      <Typography variant="h5">₹{collectionStats.general_contributions.birthday.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ minWidth: 200, flex: 1 }}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>Wedding</Typography>
                      <Typography variant="h5">₹{collectionStats.general_contributions.wedding.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ minWidth: 200, flex: 1 }}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>Special Thanks</Typography>
                      <Typography variant="h5">₹{collectionStats.general_contributions.special_thanks.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ minWidth: 200, flex: 1 }}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>Others</Typography>
                      <Typography variant="h5">₹{collectionStats.general_contributions.others.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* Special Funds */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Special Funds
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 300, flex: 1 }}>
                  <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        St. Stephen Social Aid Fund
                      </Typography>
                      <Typography variant="h4">
                        ₹{collectionStats.st_stephen_social_aid_fund.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ minWidth: 300, flex: 1 }}>
                  <Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Mission and Evangelism Fund
                      </Typography>
                      <Typography variant="h4">
                        ₹{collectionStats.mission_and_evangelism_fund.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {lastMessage && (
        <Paper sx={{ p: 2, mt: 3, backgroundColor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="subtitle2">
            Real-time Update: {lastMessage.type}
          </Typography>
          <Typography variant="caption">
            {lastMessage.timestamp}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DashboardPage;