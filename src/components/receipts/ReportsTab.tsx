import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Download,
  Assessment,
  Receipt,
  DateRange,
  PictureAsPdf,
  TableChart,
  Refresh
} from '@mui/icons-material';
import apiService from '../../services/api';

interface OffertoryReportResponse {
  success: boolean;
  report_filename: string;
  service_date: string;
  service_type: string;
  report_type: string;
  download_url: string;
  generated_at: string;
}

interface SummaryReportData {
  period_start: string;
  period_end: string;
  total_receipts: number;
  total_amount: number;
  breakdown_by_type: { [key: string]: number };
  top_contributors: Array<{ name: string; total: number }>;
  monthly_totals: Array<{ month: string; total: number }>;
}

const ReportsTab: React.FC = () => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [serviceType, setServiceType] = useState('Worship Service');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offertoryResult, setOffertoryResult] = useState<OffertoryReportResponse | null>(null);
  
  // Summary report state
  const [summaryStartDate, setSummaryStartDate] = useState('');
  const [summaryEndDate, setSummaryEndDate] = useState('');
  const [summaryData, setSummaryData] = useState<SummaryReportData | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const serviceTypes = [
    'Worship Service',
    'Evening Service',
    'Prayer Meeting',
    'Special Service',
    'Wedding',
    'Funeral',
    'Other'
  ];

  const reportFormats = [
    { value: 'pdf', label: 'PDF', icon: <PictureAsPdf /> },
    { value: 'excel', label: 'Excel', icon: <TableChart /> },
    { value: 'csv', label: 'CSV', icon: <TableChart /> }
  ];

  useEffect(() => {
    loadAvailableDates();
  }, []);

  const loadAvailableDates = async () => {
    setIsLoadingDates(true);
    try {
      const response = await apiService.get('/api/invoices/reports/available-dates');
      setAvailableDates(response.data.available_dates);
      if (response.data.available_dates.length > 0) {
        setSelectedDate(response.data.available_dates[0]);
      }
    } catch (err: any) {
      setError('Error loading available dates: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoadingDates(false);
    }
  };

  const handleGenerateOffertoryReport = async () => {
    if (!selectedDate) {
      setError('Please select a service date');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setOffertoryResult(null);

    try {
      const response = await apiService.post<OffertoryReportResponse>('/api/invoices/reports/offertory', {
        service_date: selectedDate,
        service_type: serviceType,
        report_format: reportFormat
      });

      setOffertoryResult(response.data);
    } catch (err: any) {
      setError('Error generating offertory report: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSummaryReport = async () => {
    if (!summaryStartDate || !summaryEndDate) {
      setError('Please select both start and end dates for summary report');
      return;
    }

    if (new Date(summaryStartDate) > new Date(summaryEndDate)) {
      setError('Start date cannot be after end date');
      return;
    }

    setIsGeneratingSummary(true);
    setError(null);
    setSummaryData(null);

    try {
      const response = await apiService.post<SummaryReportData>('/api/invoices/reports/summary', {
        start_date: summaryStartDate,
        end_date: summaryEndDate
      });

      setSummaryData(response.data);
    } catch (err: any) {
      setError('Error generating summary report: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleDownloadReport = async (filename: string) => {
    try {
      const response = await apiService.get(`/api/invoices/reports/download/${filename}`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('Error downloading report: ' + (err.response?.data?.detail || err.message));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Reports Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Generate and view various reports based on receipt data.
      </Typography>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Offertory Reports */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Receipt sx={{ mr: 1 }} />
                Offertory Reports
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    Available Dates: {availableDates.length}
                  </Typography>
                  <IconButton size="small" onClick={loadAvailableDates} disabled={isLoadingDates}>
                    <Refresh />
                  </IconButton>
                </Box>
                
                {isLoadingDates && <CircularProgress size={20} />}
                
                {availableDates.length === 0 && !isLoadingDates && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No receipt data available for reports. Please generate some receipts first.
                  </Alert>
                )}
              </Box>

              {availableDates.length > 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Service Date</InputLabel>
                      <Select
                        value={selectedDate}
                        label="Service Date"
                        onChange={(e) => setSelectedDate(e.target.value)}
                      >
                        {availableDates.map((date) => (
                          <MenuItem key={date} value={date}>
                            {new Date(date).toLocaleDateString()}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Service Type</InputLabel>
                      <Select
                        value={serviceType}
                        label="Service Type"
                        onChange={(e) => setServiceType(e.target.value)}
                      >
                        {serviceTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Report Format</InputLabel>
                      <Select
                        value={reportFormat}
                        label="Report Format"
                        onChange={(e) => setReportFormat(e.target.value)}
                      >
                        {reportFormats.map((format) => (
                          <MenuItem key={format.value} value={format.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {format.icon}
                              <Typography sx={{ ml: 1 }}>{format.label}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleGenerateOffertoryReport}
                      disabled={isGenerating || !selectedDate}
                      startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <Assessment />}
                    >
                      {isGenerating ? 'Generating Report...' : 'Generate Offertory Report'}
                    </Button>
                  </Grid>
                </Grid>
              )}

              {/* Offertory Report Result */}
              {offertoryResult && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Report Generated Successfully!</Typography>
                  <Typography variant="body2">
                    <strong>Service:</strong> {offertoryResult.service_type} - {new Date(offertoryResult.service_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Format:</strong> {offertoryResult.report_type}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Generated:</strong> {new Date(offertoryResult.generated_at).toLocaleString()}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleDownloadReport(offertoryResult.report_filename)}
                  >
                    Download Report
                  </Button>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Reports */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <DateRange sx={{ mr: 1 }} />
                Summary Reports
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={summaryStartDate}
                    onChange={(e) => setSummaryStartDate(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={summaryEndDate}
                    onChange={(e) => setSummaryEndDate(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleGenerateSummaryReport}
                    disabled={isGeneratingSummary || !summaryStartDate || !summaryEndDate}
                    startIcon={isGeneratingSummary ? <CircularProgress size={20} color="inherit" /> : <Assessment />}
                  >
                    {isGeneratingSummary ? 'Generating Summary...' : 'Generate Summary Report'}
                  </Button>
                </Grid>
              </Grid>

              {/* Summary Report Results */}
              {summaryData && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Summary Report Results</Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {summaryData.total_receipts}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Receipts
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {formatCurrency(summaryData.total_amount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Amount
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle1" gutterBottom>Breakdown by Type</Typography>
                  <List dense>
                    {Object.entries(summaryData.breakdown_by_type).map(([type, amount]) => (
                      <ListItem key={type}>
                        <ListItemText primary={type.replace(/([A-Z])/g, ' $1').trim()} />
                        <ListItemSecondaryAction>
                          <Chip label={formatCurrency(amount)} color="primary" variant="outlined" />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>

                  {summaryData.top_contributors.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>Top Contributors</Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell align="right">Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {summaryData.top_contributors.slice(0, 5).map((contributor, index) => (
                              <TableRow key={index}>
                                <TableCell>{contributor.name}</TableCell>
                                <TableCell align="right">{formatCurrency(contributor.total)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsTab;


