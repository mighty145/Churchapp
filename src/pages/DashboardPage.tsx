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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { DashboardStats, CollectionStatistics, ExtractRecord } from '../types';
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
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [collectionStartDate, setCollectionStartDate] = useState<string>('');
  const [collectionEndDate, setCollectionEndDate] = useState<string>('');
  const [extractRecords, setExtractRecords] = useState<ExtractRecord[]>([]);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [downloadingReceipts, setDownloadingReceipts] = useState<Set<string>>(new Set());
  const { user, isAdmin } = useAuth();
  const { lastMessage, isConnected } = useWebSocket();

  // Helper function to format date as DD-MMM-YYYY
  const formatDate = (dateString: string): string => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper function to convert number to words (Indian numbering system)
  const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero Rupees';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
    };
    
    // Indian numbering: Crores, Lakhs, Thousands, Hundreds
    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const remainder = Math.floor(num % 1000);
    
    let result = '';
    
    if (crores > 0) {
      result += convertLessThanThousand(crores) + ' Crore ';
    }
    if (lakhs > 0) {
      result += convertLessThanThousand(lakhs) + ' Lakh ';
    }
    if (thousands > 0) {
      result += convertLessThanThousand(thousands) + ' Thousand ';
    }
    if (remainder > 0) {
      result += convertLessThanThousand(remainder);
    }
    
    return result.trim() + ' Rupees';
  };

  // Initialize date range (current financial year by default)
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based (September = 8)
    
    // Calculate current financial year start year
    let fyStartYear;
    if (currentMonth >= 8) { // September (8) onwards - we're in the current FY
      fyStartYear = currentYear;
    } else { // January to August - we're in the previous FY
      fyStartYear = currentYear - 1;
    }
    
    // Create start date string directly (avoids timezone issues)
    const startDateString = `${fyStartYear}-09-30`; // 30th September of financial year
    const endDateString = today.toISOString().split('T')[0];
    
    setStartDate(startDateString);
    setEndDate(endDateString);
    
    // For Load Collection: set default start date as 30th Sep 2025 and end date as current date
    setCollectionStartDate('2025-09-30');
    setCollectionEndDate(endDateString);
  }, []);

  // Helper function to get financial year
  const getFinancialYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based, so September = 8
    
    if (currentMonth >= 8) { // September (8) onwards
      return { startYear: currentYear, endYear: currentYear + 1 };
    } else { // January to August
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

  const loadCollections = async () => {
    if (!collectionStartDate || !collectionEndDate) {
      alert('Please select both start and end dates');
      return;
    }

    try {
      setLoadingCollections(true);
      console.log('Loading collections from', collectionStartDate, 'to', collectionEndDate);
      const data = await apiService.getExtractRecordsByDateRange(collectionStartDate, collectionEndDate);
      
      // Filter and map the data to extract only the records with id starting with "extract"
      const filteredRecords = data
        .filter((record: any) => record.id && record.id.startsWith('extract'))
        .map((record: any) => ({
          id: record.id,
          invoice_date: record.invoice_date,
          receipt_no: record.receipt_no,
          name: record.name,
          payment_method: record.payment_method,
          total: record.total,
          description: record.description,
        }))
        .sort((a: any, b: any) => {
          // Sort by receipt_no in ascending order
          const receiptA = a.receipt_no || '';
          const receiptB = b.receipt_no || '';
          return receiptA.localeCompare(receiptB, undefined, { numeric: true });
        });
      
      setExtractRecords(filteredRecords);
      console.log('Loaded extract records:', filteredRecords);
    } catch (error) {
      console.error('Error loading collections:', error);
      alert('Error loading collections');
    } finally {
      setLoadingCollections(false);
    }
  };

  const downloadCollectionsCSV = () => {
    // Filter records based on payment method filter
    const filteredRecords = extractRecords.filter(
      record => paymentMethodFilter === 'ALL' || record.payment_method === paymentMethodFilter
    );

    // Create CSV header
    const headers = ['Sr. No', 'Receipt No.', 'Date', 'Name', 'Amount', 'Payment Method', 'Description'];
    
    // Create CSV rows
    const rows = filteredRecords.map((record, index) => [
      index + 1,
      record.receipt_no,
      formatDate(record.invoice_date),
      record.name,
      record.total.toFixed(2),
      record.payment_method,
      `"${record.description.replace(/"/g, '""')}"` // Escape quotes in description
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `collections_${collectionStartDate}_to_${collectionEndDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReceipt = async (receiptNumber: string) => {
    try {
      // Add to downloading set
      setDownloadingReceipts(prev => new Set(prev).add(receiptNumber));

      // Download receipt PDF from blob storage with original filename
      const { blob, filename } = await apiService.downloadInvoiceReceiptPDF(receiptNumber);
      
      // Create download link with original filename
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. The receipt may not be available.');
    } finally {
      // Remove from downloading set
      setDownloadingReceipts(prev => {
        const newSet = new Set(prev);
        newSet.delete(receiptNumber);
        return newSet;
      });
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
            Financial Year (30-Sep-{startYear} to 31-Mar-{endYear})
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            <Card sx={{ minWidth: 200, flex: 1 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Collections
                </Typography>
                <Typography variant="h4">
                  ₹{(stats.collections.total_collections_amount || 0).toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.7rem' }}>
                  {numberToWords(Math.floor(stats.collections.total_collections_amount || 0))}
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ minWidth: 200, flex: 1 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Expenditure
                </Typography>
                <Typography variant="h4">
                  ₹{(stats.collections.total_expenditure || 0).toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.7rem' }}>
                  {numberToWords(Math.floor(stats.collections.total_expenditure || 0))}
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ minWidth: 200, flex: 1 }}>
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

          {/* Load Collection Date Range Picker */}
          <Paper sx={{ p: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ minWidth: 200, flex: 1 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={collectionStartDate}
                  onChange={(e) => setCollectionStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ minWidth: 200, flex: 1 }}>
                <TextField
                  label="End Date"
                  type="date"
                  value={collectionEndDate}
                  onChange={(e) => setCollectionEndDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ minWidth: 200, flex: 1 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={loadCollections}
                  disabled={loadingCollections || !collectionStartDate || !collectionEndDate}
                  fullWidth
                  sx={{ height: 56 }}
                >
                  {loadingCollections ? <CircularProgress size={24} /> : 'Load Collection'}
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Extract Records Table Display */}
          {extractRecords.length > 0 && (
            <Box sx={{ mt: 3 }}>
              {/* Payment Method Filter and Download Button */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={paymentMethodFilter}
                      label="Payment Method"
                      onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    >
                      <MenuItem value="ALL">All</MenuItem>
                      <MenuItem value="CASH">CASH</MenuItem>
                      <MenuItem value="CHEQUE">CHEQUE</MenuItem>
                      <MenuItem value="ONLINE">ONLINE</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={downloadCollectionsCSV}
                    sx={{ height: 56 }}
                  >
                    Download CSV
                  </Button>
                </Box>
              </Paper>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Sr. No</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Receipt No.</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Amount</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Payment Method</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Receipt</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {extractRecords
                      .filter(record => paymentMethodFilter === 'ALL' || record.payment_method === paymentMethodFilter)
                      .map((record, index) => (
                        <TableRow key={record.id} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{record.receipt_no}</TableCell>
                          <TableCell>{formatDate(record.invoice_date)}</TableCell>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>₹{record.total.toFixed(2)}</TableCell>
                          <TableCell>{record.payment_method}</TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell>
                            <Tooltip title="Download Receipt">
                              <IconButton
                                color="primary"
                                onClick={() => handleDownloadReceipt(record.receipt_no)}
                                disabled={downloadingReceipts.has(record.receipt_no)}
                                size="small"
                              >
                                {downloadingReceipts.has(record.receipt_no) ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <DownloadIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
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