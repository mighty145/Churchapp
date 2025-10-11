import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  // ...existing code...
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  // ...existing code...
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Save,
  Receipt,
  AccountBalanceWallet,
  Person,
  LocationOn,
  Phone,
  CalendarToday
} from '@mui/icons-material';
import apiService from '../../services/api';

interface InvoiceFormData {
  invoice_date: string;
  name: string;
  address: string;
  country_code: string;
  mobile_number: string;
  tithe_from_month: string;
  tithe_from_year: string;
  tithe_to_month: string;
  tithe_to_year: string;
  tithe_amount: number;
  membership_from_month: string;
  membership_from_year: string;
  membership_to_month: string;
  membership_to_year: string;
  membership_amount: number;
  birthday_thank_offering: number;
  wedding_anniversary_thank_offering: number;
  mission_and_evangelism_fund: number;
  st_stephens_social_aid_fund: number;
  special_thanks_amount: number;
  charity_fund_amount: number;
  donation_for: string;
  donation_amount: number;
  harvest_auction_comment: string;
  harvest_auction_amount: number;
  online_cheque_no: string;
  payment_method: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  total_amount: number;
  description: string;
  contribution_count: number;
}

interface GenerateReceiptResponse {
  success: boolean;
  message: string;
  receipt_number: string;
  total_amount: number;
  description: string;
  generated_at: string;
  donor_name: string;
  pdf_available?: boolean;
  download_url?: string;
}

const ManualEntryTab: React.FC = () => {
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoice_date: new Date().toISOString().split('T')[0],
    name: '',
    address: '',
    country_code: '+91',
    mobile_number: '',
    tithe_from_month: currentMonth,
    tithe_from_year: new Date().getFullYear().toString(),
    tithe_to_month: currentMonth,
    tithe_to_year: new Date().getFullYear().toString(),
    tithe_amount: 0,
    membership_from_month: currentMonth,
    membership_from_year: new Date().getFullYear().toString(),
    membership_to_month: currentMonth,
    membership_to_year: new Date().getFullYear().toString(),
    membership_amount: 0,
    birthday_thank_offering: 0,
    wedding_anniversary_thank_offering: 0,
    mission_and_evangelism_fund: 0,
    st_stephens_social_aid_fund: 0,
    special_thanks_amount: 0,
    charity_fund_amount: 0,
    donation_for: '',
    donation_amount: 0,
    harvest_auction_comment: '',
    harvest_auction_amount: 0,
    online_cheque_no: '',
    payment_method: 'CASH'
  });

  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [receiptResult, setReceiptResult] = useState<GenerateReceiptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Generate years array (current year and past 5 years, future 2 years)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 5; year <= currentYear + 2; year++) {
    years.push(year.toString());
  }

  const paymentMethods = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'ONLINE', label: 'Online Transfer' }
  ];



  const handleInputChange = (field: keyof InvoiceFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    const value = event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: field.includes('amount') ? parseFloat(value) || 0 : value
    }));

    // Clear previous validation when user makes changes
    if (validation) {
      setValidation(null);
    }
  };

  const validateForm = async () => {
    setIsValidating(true);
    setError(null);
    setValidation(null);

    try {
      const response = await apiService.post<ValidationResult>('/api/invoices/validate', formData);
      
      // Ensure response.data is a valid ValidationResult object
      if (response.data && typeof response.data === 'object' && 'valid' in response.data) {
        setValidation(response.data);
      } else {
        setError('Invalid response format from server');
      }
    } catch (err: any) {
      // Handle various error response formats
      let errorMessage = 'Error validating form';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (Array.isArray(err.response.data)) {
          // Handle FastAPI validation errors
          errorMessage = err.response.data.map((error: any) => 
            `${error.loc?.join('.')}: ${error.msg}`
          ).join(', ');
        }
      }
      
      setError(errorMessage);
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleGenerateReceipt = async () => {
    setIsGenerating(true);
    setError(null);
    setReceiptResult(null);

    try {
      const response = await apiService.post<GenerateReceiptResponse>('/api/invoices/generate-receipt', formData);
      setReceiptResult(response.data);
      
      // Reset form after successful generation
      setFormData({
        ...formData,
        name: '',
        address: '',
        country_code: '+91',
        mobile_number: '',
        tithe_from_month: currentMonth,
        tithe_from_year: new Date().getFullYear().toString(),
        tithe_to_month: currentMonth,
        tithe_to_year: new Date().getFullYear().toString(),
        tithe_amount: 0,
        membership_from_month: currentMonth,
        membership_from_year: new Date().getFullYear().toString(),
        membership_to_month: currentMonth,
        membership_to_year: new Date().getFullYear().toString(),
        membership_amount: 0,
        birthday_thank_offering: 0,
        wedding_anniversary_thank_offering: 0,
        mission_and_evangelism_fund: 0,
        st_stephens_social_aid_fund: 0,
        special_thanks_amount: 0,
        charity_fund_amount: 0,
        donation_for: '',
        donation_amount: 0,
        harvest_auction_comment: '',
        harvest_auction_amount: 0,
        online_cheque_no: ''
      });
      setValidation(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error generating receipt');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-validate when form data changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name) {
        validateForm();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Manual Receipt Entry
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter donation information manually to generate a receipt.
      </Typography>

      {/* Personal Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ mr: 1 }} />
            Personal Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Donor Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Invoice Date"
                type="date"
                value={formData.invoice_date}
                onChange={handleInputChange('invoice_date')}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleInputChange('address')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                alignItems: 'flex-start',
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <FormControl sx={{ minWidth: { xs: '100%', sm: 140 } }}>
                  <InputLabel>Country Code</InputLabel>
                  <Select
                    value={formData.country_code}
                    label="Country Code"
                    onChange={(e) => handleInputChange('country_code')(e)}
                    startAdornment={
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="+91">+91</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={formData.mobile_number}
                  onChange={handleInputChange('mobile_number')}
                  placeholder="Enter 10-digit number"
                  helperText="Enter mobile number without country code"
                  inputProps={{
                    maxLength: 10,
                    pattern: "[0-9]{10}"
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.payment_method}
                  label="Payment Method"
                  onChange={(e) => handleInputChange('payment_method')(e)}
                >
                  {paymentMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cheque/Online Reference Number"
                value={formData.online_cheque_no}
                onChange={handleInputChange('online_cheque_no')}
                disabled={formData.payment_method === 'CASH'}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contributions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalanceWallet sx={{ mr: 1 }} />
            Contributions
          </Typography>

          {/* General Contributions */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: 1, borderColor: 'divider', pb: 1 }}>
              A) General Contributions
            </Typography>
            
            <Grid container spacing={2}>
              {/* Tithe */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Tithe Period
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  mb: 2, 
                  alignItems: 'center',
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  '& .MuiFormControl-root': {
                    minWidth: { xs: '45%', sm: 'auto' }
                  }
                }}>
                  <FormControl sx={{ flex: { xs: '1 1 45%', sm: 2 } }}>
                    <InputLabel>From Month</InputLabel>
                    <Select
                      value={formData.tithe_from_month}
                      label="From Month"
                      onChange={(e) => handleInputChange('tithe_from_month')(e)}
                    >
                      {months.map((month) => (
                        <MenuItem key={month} value={month}>{month}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ flex: { xs: '1 1 45%', sm: 1 } }}>
                    <InputLabel>From Year</InputLabel>
                    <Select
                      value={formData.tithe_from_year}
                      label="From Year"
                      onChange={(e) => handleInputChange('tithe_from_year')(e)}
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography sx={{ px: 1, display: { xs: 'none', sm: 'block' } }}>to</Typography>
                  <Typography sx={{ width: '100%', textAlign: 'center', display: { xs: 'block', sm: 'none' }, fontSize: '0.875rem' }}>to</Typography>
                  <FormControl sx={{ flex: { xs: '1 1 45%', sm: 2 } }}>
                    <InputLabel>To Month</InputLabel>
                    <Select
                      value={formData.tithe_to_month}
                      label="To Month"
                      onChange={(e) => handleInputChange('tithe_to_month')(e)}
                    >
                      {months.map((month) => (
                        <MenuItem key={month} value={month}>{month}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ flex: { xs: '1 1 45%', sm: 1 } }}>
                    <InputLabel>To Year</InputLabel>
                    <Select
                      value={formData.tithe_to_year}
                      label="To Year"
                      onChange={(e) => handleInputChange('tithe_to_year')(e)}
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <TextField
                  fullWidth
                  label="Tithe Amount"
                  type="number"
                  value={formData.tithe_amount}
                  onChange={handleInputChange('tithe_amount')}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Membership */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Membership Period
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  mb: 2, 
                  alignItems: 'center',
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  '& .MuiFormControl-root': {
                    minWidth: { xs: '45%', sm: 'auto' }
                  }
                }}>
                  <FormControl sx={{ flex: { xs: '1 1 45%', sm: 2 } }}>
                    <InputLabel>From Month</InputLabel>
                    <Select
                      value={formData.membership_from_month}
                      label="From Month"
                      onChange={(e) => handleInputChange('membership_from_month')(e)}
                    >
                      {months.map((month) => (
                        <MenuItem key={month} value={month}>{month}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ flex: { xs: '1 1 45%', sm: 1 } }}>
                    <InputLabel>From Year</InputLabel>
                    <Select
                      value={formData.membership_from_year}
                      label="From Year"
                      onChange={(e) => handleInputChange('membership_from_year')(e)}
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography sx={{ px: 1, display: { xs: 'none', sm: 'block' } }}>to</Typography>
                  <Typography sx={{ width: '100%', textAlign: 'center', display: { xs: 'block', sm: 'none' }, fontSize: '0.875rem' }}>to</Typography>
                  <FormControl sx={{ flex: { xs: '1 1 45%', sm: 2 } }}>
                    <InputLabel>To Month</InputLabel>
                    <Select
                      value={formData.membership_to_month}
                      label="To Month"
                      onChange={(e) => handleInputChange('membership_to_month')(e)}
                    >
                      {months.map((month) => (
                        <MenuItem key={month} value={month}>{month}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ flex: { xs: '1 1 45%', sm: 1 } }}>
                    <InputLabel>To Year</InputLabel>
                    <Select
                      value={formData.membership_to_year}
                      label="To Year"
                      onChange={(e) => handleInputChange('membership_to_year')(e)}
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <TextField
                  fullWidth
                  label="Membership Amount"
                  type="number"
                  value={formData.membership_amount}
                  onChange={handleInputChange('membership_amount')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Thank Offerings */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Birthday Thank Offering"
                  type="number"
                  value={formData.birthday_thank_offering}
                  onChange={handleInputChange('birthday_thank_offering')}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Wedding Anniversary Thank Offering"
                  type="number"
                  value={formData.wedding_anniversary_thank_offering}
                  onChange={handleInputChange('wedding_anniversary_thank_offering')}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Other General Contributions */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Special Thanks Amount"
                  type="number"
                  value={formData.special_thanks_amount}
                  onChange={handleInputChange('special_thanks_amount')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Additional General Contributions - Donation row */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Donation Purpose"
                  value={formData.donation_for}
                  onChange={handleInputChange('donation_for')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Donation Amount"
                  type="number"
                  value={formData.donation_amount}
                  onChange={handleInputChange('donation_amount')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Harvest Auction row */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Harvest Auction Comment"
                  value={formData.harvest_auction_comment}
                  onChange={handleInputChange('harvest_auction_comment')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Harvest Auction Amount"
                  type="number"
                  value={formData.harvest_auction_amount}
                  onChange={handleInputChange('harvest_auction_amount')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* St. Stephen's Social Aid Fund */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: 1, borderColor: 'divider', pb: 1 }}>
              B) St. Stephen's Social Aid Fund
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="St. Stephen's Social Aid Fund"
                  type="number"
                  value={formData.st_stephens_social_aid_fund}
                  onChange={handleInputChange('st_stephens_social_aid_fund')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Charity Fund Amount"
                  type="number"
                  value={formData.charity_fund_amount}
                  onChange={handleInputChange('charity_fund_amount')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Mission & Evangelism Fund */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: 1, borderColor: 'divider', pb: 1 }}>
              C) Mission & Evangelism Fund
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mission & Evangelism Fund"
                  type="number"
                  value={formData.mission_and_evangelism_fund}
                  onChange={handleInputChange('mission_and_evangelism_fund')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validation && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Form Validation
            </Typography>
            
            {validation.errors && validation.errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validation.errors.map((error, index) => (
                  <div key={index}>{typeof error === 'string' ? error : JSON.stringify(error)}</div>
                ))}
              </Alert>
            )}

            {validation.warnings && validation.warnings.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {validation.warnings.map((warning, index) => (
                  <div key={index}>{typeof warning === 'string' ? warning : JSON.stringify(warning)}</div>
                ))}
              </Alert>
            )}

            {validation.valid && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Form is valid and ready for receipt generation
              </Alert>
            )}

            <Typography variant="body1">
              <strong>Total Amount:</strong> ₹{(validation.total_amount || 0).toFixed(2)}
            </Typography>
            <Typography variant="body1">
              <strong>Description:</strong> {validation.description || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {validation.contribution_count || 0} contribution(s) entered
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Receipt Generation Result */}
      {receiptResult && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Receipt Generated Successfully!</Typography>
          <Typography><strong>Receipt Number:</strong> {receiptResult.receipt_number}</Typography>
          <Typography><strong>Donor:</strong> {receiptResult.donor_name}</Typography>
          <Typography><strong>Total Amount:</strong> ₹{receiptResult.total_amount.toFixed(2)}</Typography>
          <Typography><strong>Description:</strong> {receiptResult.description}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Generated at: {new Date(receiptResult.generated_at).toLocaleString()}
          </Typography>
          {receiptResult.pdf_available && receiptResult.download_url && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<span>📄</span>}
                onClick={async () => {
                  try {
                    const blob = await apiService.downloadInvoiceReceiptPDF(receiptResult.receipt_number);
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Receipt_${receiptResult.receipt_number}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } catch (error: any) {
                    console.error('Download error:', error);
                    setError('Failed to download receipt: ' + (error.response?.data?.detail || error.message));
                  }
                }}
                sx={{ mr: 1 }}
              >
                Download PDF Receipt
              </Button>
            </Box>
          )}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={validateForm}
          disabled={isValidating || !formData.name}
          startIcon={isValidating ? <CircularProgress size={20} /> : <Save />}
        >
          {isValidating ? 'Validating...' : 'Validate Form'}
        </Button>
        
        <Button
          variant="contained"
          onClick={handleGenerateReceipt}
          disabled={isGenerating || !validation?.valid}
          startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <Receipt />}
        >
          {isGenerating ? 'Generating...' : 'Generate Receipt'}
        </Button>
      </Box>
    </Box>
  );
};

export default ManualEntryTab;


