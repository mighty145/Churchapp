import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Receipt,
  Download,
  Refresh
} from '@mui/icons-material';
// import { useDropzone } from 'react-dropzone';
import apiService from '../../services/api';

interface ExtractedData {
  invoice_date?: string;
  name?: string;
  address?: string;
  mobile_number?: string;
  tithe_month?: string;
  tithe_amount?: number;
  membership_month?: string;
  membership_amount?: number;
  birthday_thank_offering?: number;
  wedding_anniversary_thank_offering?: number;
  mission_and_evangelism_fund?: number;
  st_stephens_social_aid_fund?: number;
  special_thanks_amount?: number;
  charity_fund_amount?: number;
  donation_for?: string;
  donation_amount?: number;
  harvest_auction_comment?: string;
  harvest_auction_amount?: number;
  online_cheque_no?: string;
  payment_method?: string;
}

interface UploadResponse {
  success: boolean;
  filename: string;
  extracted_data: ExtractedData;
  message: string;
  timestamp: number;
  file_size: number;
  processing_method: string;
}

interface GenerateReceiptResponse {
  success: boolean;
  message: string;
  receipt_number: string;
  total_amount: number;
  description: string;
  generated_at: string;
  donor_name: string;
}

const FileUploadTab: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [receiptResult, setReceiptResult] = useState<GenerateReceiptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadResult(null);
    setReceiptResult(null);
    setExtractedData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('processing_method', 'openai');

      const response = await apiService.post<UploadResponse>('/api/invoices/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data);
      setExtractedData(response.data.extracted_data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateReceipt = async () => {
    if (!extractedData) return;

    setIsGenerating(true);
    setError(null);
    setReceiptResult(null);

    try {
      const response = await apiService.post<GenerateReceiptResponse>('/api/invoices/generate-receipt', extractedData);
      setReceiptResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error generating receipt');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount || amount === 0) return '-';
    return `₹${amount.toFixed(2)}`;
  };

  const calculateTotal = (data: ExtractedData): number => {
    const amounts = [
      data.tithe_amount,
      data.membership_amount,
      data.birthday_thank_offering,
      data.wedding_anniversary_thank_offering,
      data.mission_and_evangelism_fund,
      data.st_stephens_social_aid_fund,
      data.special_thanks_amount,
      data.charity_fund_amount,
      data.donation_amount,
      data.harvest_auction_amount
    ];

    return amounts.reduce((total: number, amount) => total + (amount || 0), 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload & Process Invoice
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload an image or PDF of an invoice to automatically extract donation information.
      </Typography>

      {/* Upload Area */}
      <Paper
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: 'grey.300',
          textAlign: 'center',
          mb: 3
        }}
      >
        <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        {isUploading ? (
          <Box>
            <CircularProgress size={24} sx={{ mb: 2 }} />
            <Typography variant="body1">Processing file...</Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Invoice File
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Supported formats: PNG, JPG, JPEG, GIF, BMP, TIFF, PDF (max 16MB)
            </Typography>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUpload />}
              disabled={isUploading}
            >
              Choose File
              <input
                type="file"
                hidden
                accept="image/*,.pdf"
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        )}
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Upload Results */}
      {uploadResult && extractedData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Description color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Extracted Information</Typography>
              <Chip 
                label={uploadResult.processing_method.toUpperCase()} 
                size="small" 
                color="primary" 
                sx={{ ml: 2 }} 
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Personal Information</Typography>
                <Typography><strong>Name:</strong> {extractedData.name || 'N/A'}</Typography>
                <Typography><strong>Address:</strong> {extractedData.address || 'N/A'}</Typography>
                <Typography><strong>Mobile:</strong> {extractedData.mobile_number || 'N/A'}</Typography>
                <Typography><strong>Invoice Date:</strong> {extractedData.invoice_date || 'N/A'}</Typography>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Payment Information</Typography>
                <Typography><strong>Payment Method:</strong> {extractedData.payment_method || 'CASH'}</Typography>
                <Typography><strong>Cheque/Online No:</strong> {extractedData.online_cheque_no || 'N/A'}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>Contributions</Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' }, minWidth: 0 }}>
                {extractedData.tithe_amount ? (
                  <Typography><strong>Tithe ({extractedData.tithe_month}):</strong> {formatAmount(extractedData.tithe_amount)}</Typography>
                ) : null}
                {extractedData.membership_amount ? (
                  <Typography><strong>Membership ({extractedData.membership_month}):</strong> {formatAmount(extractedData.membership_amount)}</Typography>
                ) : null}
                {extractedData.birthday_thank_offering ? (
                  <Typography><strong>Birthday Offering:</strong> {formatAmount(extractedData.birthday_thank_offering)}</Typography>
                ) : null}
                {extractedData.wedding_anniversary_thank_offering ? (
                  <Typography><strong>Anniversary Offering:</strong> {formatAmount(extractedData.wedding_anniversary_thank_offering)}</Typography>
                ) : null}
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' }, minWidth: 0 }}>
                {extractedData.mission_and_evangelism_fund ? (
                  <Typography><strong>Mission & Evangelism:</strong> {formatAmount(extractedData.mission_and_evangelism_fund)}</Typography>
                ) : null}
                {extractedData.st_stephens_social_aid_fund ? (
                  <Typography><strong>Social Aid Fund:</strong> {formatAmount(extractedData.st_stephens_social_aid_fund)}</Typography>
                ) : null}
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' }, minWidth: 0 }}>
                {extractedData.special_thanks_amount ? (
                  <Typography><strong>Special Thanks:</strong> {formatAmount(extractedData.special_thanks_amount)}</Typography>
                ) : null}
                {extractedData.charity_fund_amount ? (
                  <Typography><strong>Charity Fund:</strong> {formatAmount(extractedData.charity_fund_amount)}</Typography>
                ) : null}
                {extractedData.donation_amount ? (
                  <Typography><strong>Donation ({extractedData.donation_for}):</strong> {formatAmount(extractedData.donation_amount)}</Typography>
                ) : null}
                {extractedData.harvest_auction_amount ? (
                  <Typography><strong>Harvest Auction:</strong> {formatAmount(extractedData.harvest_auction_amount)}</Typography>
                ) : null}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                <strong>Total Amount: ₹{calculateTotal(extractedData).toFixed(2)}</strong>
              </Typography>
              
              <Button
                variant="contained"
                startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <Receipt />}
                onClick={handleGenerateReceipt}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Receipt'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Receipt Generation Results */}
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
        </Alert>
      )}
    </Box>
  );
};

export default FileUploadTab;
