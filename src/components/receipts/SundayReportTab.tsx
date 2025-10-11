import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Card,
  CardContent,
  Menu,
  MenuItem
} from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import apiService from '../../services/api';

interface DenominationData {
  denomination500: number | string;
  denomination200: number | string;
  denomination100: number | string;
  denomination50: number | string;
  denomination20: number | string;
  denomination10: number | string;
  coins: number | string;
}

interface ExtractRecord {
  id: string;
  name: string;
  total: number;
  description: string;
  originalData?: any; // Store original record for reference
}

interface SundaySignatory {
  id: string;
  name: string;
  signature: string;
  date: Date | null;
}

interface PastorSignatory {
  id: string;
  title: string;
  name: string;
  signature: string;
  date: Date | null;
}

interface SundayReportData {
  reportDate: Date | null;
  firstOffering: DenominationData;
  secondOffering: DenominationData;
  extractRecords: ExtractRecord[];
}

const SundayReportTab: React.FC = () => {
  const [reportData, setReportData] = useState<SundayReportData>({
    reportDate: new Date(),
    firstOffering: {
      denomination500: '',
      denomination200: '',
      denomination100: '',
      denomination50: '',
      denomination20: '',
      denomination10: '',
      coins: ''
    },
    secondOffering: {
      denomination500: '',
      denomination200: '',
      denomination100: '',
      denomination50: '',
      denomination20: '',
      denomination10: '',
      coins: ''
    },
    extractRecords: []
  });

  const [message, setMessage] = useState('');
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Cheque Records State
  const [chequeRecords, setChequeRecords] = useState<ExtractRecord[]>([]);
  const [loadingChequeRecords, setLoadingChequeRecords] = useState(false);

  // Signatories State
  const [sundaySignatories, setSundaySignatories] = useState<SundaySignatory[]>([
    { id: '1', name: 'Sucheta Parag Mate', signature: '', date: new Date() },
    { id: '2', name: 'Jyothi Peter', signature: '', date: new Date() },
    { id: '3', name: 'Vedha Priyadharsini P', signature: '', date: new Date() },
    { id: '4', name: 'Ashish Kumar', signature: '', date: new Date() },
    { id: '5', name: 'Mighty Basumata', signature: '', date: new Date() }
  ]);

  // Generated report files state
  const [generatedFiles, setGeneratedFiles] = useState<{
    docx_filename?: string;
    pdf_filename?: string;
    docx_download_url?: string;
    pdf_download_url?: string;
  } | null>(null);
  
  const [pastorSignatories, setPastorSignatories] = useState<PastorSignatory[]>([
    {
      id: 'pastor-1',
      title: 'Pastor In-Charge',
      name: 'Rev. Isaac Paulraj',
      signature: '',
      date: new Date()
    }
  ]);

  // Download dropdown state
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Refs for maintaining focus on inputs
  const inputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

  // Create array of field names in tab order
  const tabOrder = useMemo(() => [
    'firstOffering-denomination500',
    'firstOffering-denomination200', 
    'firstOffering-denomination100',
    'firstOffering-denomination50',
    'firstOffering-denomination20',
    'firstOffering-denomination10',
    'firstOffering-coins',
    'secondOffering-denomination500',
    'secondOffering-denomination200',
    'secondOffering-denomination100', 
    'secondOffering-denomination50',
    'secondOffering-denomination20',
    'secondOffering-denomination10',
    'secondOffering-coins'
  ], []);

  // Debug: Log all refs after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('📊 All input refs:', Object.keys(inputRefs.current));
      console.log('� Tab order:', tabOrder);
      console.log('� Checking refs existence:');
      tabOrder.forEach(key => {
        const ref = inputRefs.current[key];
        console.log(`  ${key}: ${ref ? '✅ exists' : '❌ missing'}`);
      });
    }, 1000); // Wait for component to fully render
    
    return () => clearTimeout(timer);
  }, [tabOrder]);

  const calculateTotal = (offering: DenominationData): number => {
    const toNumber = (value: number | string): number => {
      if (typeof value === 'string') {
        return value === '' ? 0 : parseInt(value) || 0;
      }
      return value || 0;
    };
    
    return (
      toNumber(offering.denomination500) * 500 +
      toNumber(offering.denomination200) * 200 +
      toNumber(offering.denomination100) * 100 +
      toNumber(offering.denomination50) * 50 +
      toNumber(offering.denomination20) * 20 +
      toNumber(offering.denomination10) * 10 +
      toNumber(offering.coins)
    );
  };

  const formatCurrency = (amount: number): string => {
    return `₹ ${amount.toLocaleString('en-IN')}`;
  };

  const handleOfferingChange = useCallback((
    offeringType: 'firstOffering' | 'secondOffering',
    field: keyof DenominationData,
    value: string
  ) => {
    // Store the string value directly to preserve user input during typing
    setReportData(prev => ({
      ...prev,
      [offeringType]: {
        ...prev[offeringType],
        [field]: value
      }
    }));
  }, []);

  // Create handlers that only update on blur (when user finishes typing)
  const createFieldHandler = useCallback((offeringType: 'firstOffering' | 'secondOffering', field: keyof DenominationData) => {
    const fieldKey = `${offeringType}-${field}`;
    const tabIndex = tabOrder.indexOf(fieldKey) + 1;
    
    return {
      tabIndex,
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        handleOfferingChange(offeringType, field, e.target.value);
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          const currentIndex = tabOrder.indexOf(fieldKey);
          
          // Move to next field on Enter
          const nextIndex = currentIndex < tabOrder.length - 1 ? currentIndex + 1 : 0;
          const nextFieldKey = tabOrder[nextIndex];
          const nextInput = inputRefs.current[nextFieldKey];
          
          if (nextInput) {
            nextInput.focus();
            nextInput.select();
          }
        }
      }
    };
  }, [handleOfferingChange, tabOrder]);

  const fetchExtractRecords = async (selectedDate: Date) => {
    if (!selectedDate) return;

    setLoadingRecords(true);
    try {
      // Format date to match the InvoiceDate format in Extract.csv (YYYY-MM-DD)
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      console.log('🔍 Fetch Extract Records Debug:');
      console.log('📅 Date:', dateStr);
      console.log('🌐 Using API service for authenticated request');
      
      // Use apiService which handles authentication automatically
      const responseData = await apiService.getExtractRecordsByDate(dateStr);
      
      console.log('✅ Success! API response data:', responseData);
      console.log('📊 Found records:', responseData.records?.length || 0);
      
      const extractRecords: ExtractRecord[] = responseData.records.map((record: any, index: number) => ({
        id: `extract-${record.ReceiptNo || index}`,
        name: record.Name || '',
        total: parseFloat(record.Total) || 0,
        description: record.Description || '',
        originalData: record
      }));

      console.log('🔄 Processed records:', extractRecords);

      setReportData(prev => ({
        ...prev,
        extractRecords
      }));
      
      if (responseData.records.length > 0) {
        setMessage(`✅ Loaded ${responseData.records.length} cash receipt records for ${selectedDate.toLocaleDateString()}`);
      } else {
        setMessage(`ℹ️ No cash receipt records found for ${selectedDate.toLocaleDateString()}`);
      }
    } catch (error: any) {
      console.error('Error fetching extract records:', error);
      
      if (error.response?.status === 401) {
        setMessage('❌ Authentication required. Please login as an admin to load receipt records.');
      } else if (error.response?.status === 403) {
        setMessage('❌ Admin access required to load receipt records.');
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setMessage('⏱️ Request timed out. Please check your connection and try again.');
      } else if (error.message?.includes('Network Error') || !navigator.onLine) {
        setMessage('🔌 Unable to connect to server. Please check your network connection.');
      } else {
        setMessage(`⚠️ Error loading receipt records: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
      }
      
      // For demonstration, add some mock data if it's today's date
      if (selectedDate.toDateString() === new Date().toDateString()) {
        const mockRecords: ExtractRecord[] = [
          {
            id: 'mock-1',
            name: 'Test User Complete',
            total: 3100,
            description: 'Tithe for SEPTEMBER 2025 to OCTOBER 2025, Membership for JANUARY 2025 to DECEMBER 2025, Birthday Thank Offering, Special Thanks, Donation for Building Fund'
          },
          {
            id: 'mock-2', 
            name: 'Mighty Basumata',
            total: 6900,
            description: 'Tithe for OCTOBER 2025, Membership for OCTOBER 2025, Birthday Thank Offering, Wedding Anniversary Thank Offering, Home Mission Pledges, Mission and Evangelism Fund, St. Stephen\'s Social Aid Fund, Special Thanks, Charity Fund, Donation for For Testing, Harvest Auction'
          }
        ];
        setReportData(prev => ({
          ...prev,
          extractRecords: mockRecords
        }));
        setMessage(`📄 Loaded sample data for ${selectedDate.toLocaleDateString()} (server connection failed)`);
      } else {
        setReportData(prev => ({
          ...prev,
          extractRecords: []
        }));
      }
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleDateChange = (newDate: Date | null) => {
    setReportData(prev => ({ 
      ...prev, 
      reportDate: newDate,
      extractRecords: [] // Clear existing records when date changes
    }));
    setMessage(''); // Clear any previous messages
  };

  const handleExtractRecordChange = (id: string, field: keyof ExtractRecord, value: string | number) => {
    setReportData(prev => ({
      ...prev,
      extractRecords: prev.extractRecords.map(record =>
        record.id === id
          ? { ...record, [field]: field === 'total' ? parseFloat(value as string) || 0 : value }
          : record
      )
    }));
  };

  const loadExtractRecords = () => {
    console.log('🔘 Load Records button clicked!');
    console.log('📅 Current report date:', reportData.reportDate);
    
    if (reportData.reportDate) {
      console.log('✅ Date exists, calling fetchExtractRecords...');
      fetchExtractRecords(reportData.reportDate);
    } else {
      console.log('❌ No report date selected');
      setMessage('Please select a report date first');
    }
  };

  const addNewExtractRecord = () => {
    const newRecord: ExtractRecord = {
      id: `new-${Date.now()}`,
      name: '',
      total: 0,
      description: ''
    };
    setReportData(prev => ({
      ...prev,
      extractRecords: [...prev.extractRecords, newRecord]
    }));
  };

  const removeExtractRecord = (id: string) => {
    setReportData(prev => ({
      ...prev,
      extractRecords: prev.extractRecords.filter(record => record.id !== id)
    }));
  };

  const handleSubmit = async () => {
    if (!reportData.reportDate) {
      setMessage('Please select a report date');
      return;
    }

    // Convert form data to backend format
    const requestData = {
      report_date: reportData.reportDate.toISOString().split('T')[0],
      first_offering: {
        denomination500: parseInt(String(reportData.firstOffering.denomination500) || '0') || 0,
        denomination200: parseInt(String(reportData.firstOffering.denomination200) || '0') || 0,
        denomination100: parseInt(String(reportData.firstOffering.denomination100) || '0') || 0,
        denomination50: parseInt(String(reportData.firstOffering.denomination50) || '0') || 0,
        denomination20: parseInt(String(reportData.firstOffering.denomination20) || '0') || 0,
        denomination10: parseInt(String(reportData.firstOffering.denomination10) || '0') || 0,
        coins: parseFloat(String(reportData.firstOffering.coins) || '0') || 0
      },
      second_offering: {
        denomination500: parseInt(String(reportData.secondOffering.denomination500) || '0') || 0,
        denomination200: parseInt(String(reportData.secondOffering.denomination200) || '0') || 0,
        denomination100: parseInt(String(reportData.secondOffering.denomination100) || '0') || 0,
        denomination50: parseInt(String(reportData.secondOffering.denomination50) || '0') || 0,
        denomination20: parseInt(String(reportData.secondOffering.denomination20) || '0') || 0,
        denomination10: parseInt(String(reportData.secondOffering.denomination10) || '0') || 0,
        coins: parseFloat(String(reportData.secondOffering.coins) || '0') || 0
      },
      cash_records: reportData.extractRecords.map(record => ({
        name: record.name,
        description: record.description,
        amount: record.total,
        payment_method: 'CASH'
      })),
      cheque_records: chequeRecords.map(record => ({
        name: record.name,
        description: record.description,
        amount: record.total,
        payment_method: 'CHEQUE'
      })),
      sunday_signatories: sundaySignatories.map(sig => ({
        name: sig.name,
        signature: sig.signature || '',
        date: sig.date ? sig.date.toISOString().split('T')[0] : null
      })),
      pastor_signatories: pastorSignatories.map(sig => ({
        title: sig.title,
        name: sig.name,
        signature: sig.signature || '',
        date: sig.date ? sig.date.toISOString().split('T')[0] : null
      })),
      remarks: ''
    };

    try {
      setMessage('Generating Sunday report...');
      
      // Use API service instead of manual fetch
      const result = await apiService.generateSundayReport(requestData);
      setMessage(`✅ Sunday report generated successfully! Total: ₹${result.grand_total}`);
      
      // Store generated file information for download buttons (DOCX only)
      setGeneratedFiles({
        docx_filename: result.docx_filename,
        pdf_filename: undefined, // No PDF generated yet
        docx_download_url: result.docx_download_url,
        pdf_download_url: undefined // No PDF URL yet
      });
      
      console.log('Sunday Report Generated:', result);
    } catch (error: any) {
      console.error('Error generating Sunday report:', error);
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data || {};
        
        console.log('❌ Sunday Report API response error:', status, errorData);
        
        if (status === 401) {
          setMessage('❌ Authentication required. Please login as an admin to generate reports.');
        } else if (status === 403) {
          setMessage('❌ Admin access required to generate reports.');
        } else {
          setMessage(`❌ Failed to generate report: ${errorData.detail || 'Server error'} (Status: ${status})`);
        }
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        setMessage('🔌 Unable to connect to server. Please ensure the backend is running.');
      } else {
        setMessage('⚠️ Network error occurred while generating report.');
      }
    }
  };

  const handleDownload = async (filename: string, downloadUrl: string) => {
    try {
      console.log(`📥 Download request: filename=${filename}, url=${downloadUrl}`);
      
      if (!filename || !downloadUrl) {
        console.error('Download failed: missing filename or URL');
        setMessage('❌ Download failed: Invalid file information');
        return;
      }
      
      console.log('🔄 Requesting fresh PDF from server...');
      
      // Use API service with cache busting
      const blob = await apiService.downloadSundayReportFile(downloadUrl);
      console.log(`📄 Downloaded blob: ${blob.size} bytes, type: ${blob.type}`);
      
      // Verify it's actually a PDF
      if (blob.type !== 'application/pdf' && !filename.toLowerCase().endsWith('.pdf')) {
        console.warn('⚠️ Downloaded file may not be a PDF:', blob.type);
      }
      
      // Log file size to help identify if we got the right version
      if (blob.size < 10000) {
        console.warn('⚠️ PDF file seems small - may not be exact DOCX conversion');
      } else if (blob.size > 100000) {
        console.log('✅ PDF file is large - likely exact DOCX conversion');
      }
      
      const url = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download error:', error);
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          setMessage('❌ Authentication required. Please login to download files.');
        } else if (status === 403) {
          setMessage('❌ Admin access required to download files.');
        } else {
          setMessage('❌ Failed to download file');
        }
      } else {
        setMessage('⚠️ Network error occurred during download');
      }
    }
  };

  const handleGeneratePdfFromExistingDocx = async () => {
    if (!generatedFiles || !generatedFiles.docx_filename) {
      setMessage('Please save the report first to generate DOCX file');
      return;
    }

    setIsGeneratingPdf(true);
    setMessage('Generating PDF from existing DOCX...');
    setDownloadAnchorEl(null);

    try {
      console.log('🔄 Converting existing DOCX to PDF:', generatedFiles.docx_filename);
      console.log('📞 Calling API endpoint: /api/sunday-reports/convert-docx-to-pdf');
      
      // Call API to convert existing DOCX to PDF (exact copy)
      const result = await apiService.convertDocxToPdf(generatedFiles.docx_filename);
      
      console.log('📦 API Response received:', {
        success: result.success,
        message: result.message,
        pdf_filename: result.pdf_filename,
        pdf_download_url: result.pdf_download_url
      });
      
      if (!result.pdf_filename || !result.pdf_download_url) {
        console.error('PDF generation failed - missing filename or URL:', result);
        setMessage('❌ PDF generation failed: No file generated');
        return;
      }
      
      setMessage(`✅ PDF generated from DOCX successfully!`);
      console.log(`Downloading PDF: ${result.pdf_filename} from ${result.pdf_download_url}`);
      
      // Download the PDF immediately with cache busting
      const cacheBustUrl = `${result.pdf_download_url}?t=${Date.now()}`;
      console.log('⬇️ Starting download:', {
        filename: result.pdf_filename,
        original_url: result.pdf_download_url,
        cache_bust_url: cacheBustUrl
      });
      await handleDownload(result.pdf_filename, cacheBustUrl);
      
    } catch (error: any) {
      console.error('Error generating PDF from DOCX:', error);
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data || {};
        
        if (status === 401) {
          setMessage('❌ Authentication required. Please login as an admin to generate PDF.');
        } else if (status === 403) {
          setMessage('❌ Admin access required to generate PDF.');
        } else {
          setMessage(`❌ Failed to generate PDF: ${errorData.detail || 'Server error'} (Status: ${status})`);
        }
      } else {
        setMessage('⚠️ Network error occurred while generating PDF.');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };



  const handleClear = () => {
    setReportData({
      reportDate: new Date(),
      firstOffering: {
        denomination500: '',
        denomination200: '',
        denomination100: '',
        denomination50: '',
        denomination20: '',
        denomination10: '',
        coins: ''
      },
      secondOffering: {
        denomination500: '',
        denomination200: '',
        denomination100: '',
        denomination50: '',
        denomination20: '',
        denomination10: '',
        coins: ''
      },
      extractRecords: []
    });
    setChequeRecords([]); // Also clear cheque records
    setGeneratedFiles(null); // Clear generated files
    
    // Reset signatories to default values
    setSundaySignatories([
      { id: '1', name: 'Sucheta Parag Mate', signature: '', date: new Date() },
      { id: '2', name: 'Jyothi Peter', signature: '', date: new Date() },
      { id: '3', name: 'Vedha Priyadharsini P', signature: '', date: new Date() },
      { id: '4', name: 'Ashish Kumar', signature: '', date: new Date() },
      { id: '5', name: 'Mighty Basumata', signature: '', date: new Date() }
    ]);
    
    setPastorSignatories([
      {
        id: 'pastor-1',
        title: 'Pastor In-Charge',
        name: 'Rev. Isaac Paulraj',
        signature: '',
        date: new Date()
      }
    ]);
    
    setMessage('');
  };

  const DenominationRow: React.FC<{
    label: string;
    offering: DenominationData;
    offeringType: 'firstOffering' | 'secondOffering';
    showAmounts?: boolean;
  }> = React.memo(({ label, offering, offeringType, showAmounts = false }) => (
    <TableRow>
      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', minWidth: '100px' }}>
        {label}
      </TableCell>
      <TableCell align="center">
        {showAmounts ? (
          <Typography variant="body2" color="text.secondary">
            {(() => {
              const num = typeof offering.denomination500 === 'string' ? parseInt(offering.denomination500) || 0 : offering.denomination500;
              return num > 0 ? (num * 500).toLocaleString() : '';
            })()}
          </Typography>
        ) : (
          <TextField
            key={`${offeringType}-denomination500`}
            inputRef={(ref) => { 
              inputRefs.current[`${offeringType}-denomination500`] = ref;
            }}
            type="number"
            defaultValue={offering.denomination500}
            {...createFieldHandler(offeringType, 'denomination500')}
            size="small"
            sx={{ width: '80px' }}
            inputProps={{ 
              min: 0,
              style: { textAlign: 'center' }
            }}
          />
        )}
      </TableCell>
      <TableCell align="center">
        {showAmounts ? (
          <Typography variant="body2" color="text.secondary">
            {(() => {
              const num = typeof offering.denomination200 === 'string' ? parseInt(offering.denomination200) || 0 : offering.denomination200;
              return num > 0 ? (num * 200).toLocaleString() : '';
            })()}
          </Typography>
        ) : (
          <TextField
            key={`${offeringType}-denomination200`}
            inputRef={(ref) => { inputRefs.current[`${offeringType}-denomination200`] = ref; }}
            type="number"
            defaultValue={offering.denomination200}
            {...createFieldHandler(offeringType, 'denomination200')}
            size="small"
            sx={{ width: '80px' }}
            inputProps={{ 
              min: 0,
              style: { textAlign: 'center' }
            }}
          />
        )}
      </TableCell>
      <TableCell align="center">
        {showAmounts ? (
          <Typography variant="body2" color="text.secondary">
            {(() => {
              const num = typeof offering.denomination100 === 'string' ? parseInt(offering.denomination100) || 0 : offering.denomination100;
              return num > 0 ? (num * 100).toLocaleString() : '';
            })()}
          </Typography>
        ) : (
          <TextField
            key={`${offeringType}-denomination100`}
            inputRef={(ref) => { inputRefs.current[`${offeringType}-denomination100`] = ref; }}
            type="number"
            defaultValue={offering.denomination100}
            {...createFieldHandler(offeringType, 'denomination100')}
            size="small"
            sx={{ width: '80px' }}
            inputProps={{ 
              min: 0,
              style: { textAlign: 'center' }
            }}
          />
        )}
      </TableCell>
      <TableCell align="center">
        {showAmounts ? (
          <Typography variant="body2" color="text.secondary">
            {(() => {
              const num = typeof offering.denomination50 === 'string' ? parseInt(offering.denomination50) || 0 : offering.denomination50;
              return num > 0 ? (num * 50).toLocaleString() : '';
            })()}
          </Typography>
        ) : (
          <TextField
            key={`${offeringType}-denomination50`}
            inputRef={(ref) => { inputRefs.current[`${offeringType}-denomination50`] = ref; }}
            type="number"
            defaultValue={offering.denomination50}
            {...createFieldHandler(offeringType, 'denomination50')}
            size="small"
            sx={{ width: '80px' }}
            inputProps={{ 
              min: 0,
              style: { textAlign: 'center' }
            }}
          />
        )}
      </TableCell>
      <TableCell align="center">
        {showAmounts ? (
          <Typography variant="body2" color="text.secondary">
            {(() => {
              const num = typeof offering.denomination20 === 'string' ? parseInt(offering.denomination20) || 0 : offering.denomination20;
              return num > 0 ? (num * 20).toLocaleString() : '';
            })()}
          </Typography>
        ) : (
          <TextField
            key={`${offeringType}-denomination20`}
            inputRef={(ref) => { inputRefs.current[`${offeringType}-denomination20`] = ref; }}
            type="number"
            defaultValue={offering.denomination20}
            {...createFieldHandler(offeringType, 'denomination20')}
            size="small"
            sx={{ width: '80px' }}
            inputProps={{ 
              min: 0,
              style: { textAlign: 'center' }
            }}
          />
        )}
      </TableCell>
      <TableCell align="center">
        {showAmounts ? (
          <Typography variant="body2" color="text.secondary">
            {(() => {
              const num = typeof offering.denomination10 === 'string' ? parseInt(offering.denomination10) || 0 : offering.denomination10;
              return num > 0 ? (num * 10).toLocaleString() : '';
            })()}
          </Typography>
        ) : (
          <TextField
            key={`${offeringType}-denomination10`}
            inputRef={(ref) => { inputRefs.current[`${offeringType}-denomination10`] = ref; }}
            type="number"
            defaultValue={offering.denomination10}
            {...createFieldHandler(offeringType, 'denomination10')}
            size="small"
            sx={{ width: '80px' }}
            inputProps={{ 
              min: 0,
              style: { textAlign: 'center' }
            }}
          />
        )}
      </TableCell>
      <TableCell align="center">
        {showAmounts ? (
          <Typography variant="body2" color="text.secondary">
            {(() => {
              const num = typeof offering.coins === 'string' ? parseInt(offering.coins) || 0 : offering.coins;
              return num > 0 ? num.toLocaleString() : '';
            })()}
          </Typography>
        ) : (
          <TextField
            key={`${offeringType}-coins`}
            inputRef={(ref) => { inputRefs.current[`${offeringType}-coins`] = ref; }}
            type="number"
            defaultValue={offering.coins}
            {...createFieldHandler(offeringType, 'coins')}
            size="small"
            sx={{ width: '80px' }}
            inputProps={{ 
              min: 0,
              style: { textAlign: 'center' }
            }}
          />
        )}
      </TableCell>
      <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
        {formatCurrency(calculateTotal(offering))}
      </TableCell>
    </TableRow>
  ));

  const totalCash = calculateTotal(reportData.firstOffering) + calculateTotal(reportData.secondOffering);

  // Cheque Records Functions
  const loadExtractChequeRecords = async () => {
    if (!reportData.reportDate) {
      setMessage('Please select a report date first');
      return;
    }

    setLoadingChequeRecords(true);
    setMessage('');

    try {
      const selectedDate = reportData.reportDate;
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      console.log('🧾 Loading cheque records for date:', formattedDate);
      console.log('📅 Selected date object:', selectedDate);
      
      // Use API service instead of manual fetch
      const data = await apiService.getExtractChequeRecordsByDate(formattedDate);
      console.log('✅ Cheque API success response:', data);
      
      const chequeRecords = data.records.map((record: any, index: number) => ({
        id: `cheque-${Date.now()}-${index}`,
        name: record.Name || '',
        total: parseFloat(record.Total) || 0,
        description: record.Description || '',
        originalData: record
      }));
      
      setChequeRecords(chequeRecords);
      
      if (data.records.length > 0) {
        setMessage(`✅ Loaded ${data.records.length} cheque receipt records for ${selectedDate.toLocaleDateString()}`);
      } else {
        setMessage(`ℹ️ No cheque receipt records found for ${selectedDate.toLocaleDateString()}`);
      }
    } catch (error: any) {
      console.error('Error fetching cheque extract records:', error);
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data || {};
        
        console.log('❌ Cheque API response error:', status, errorData);
        
        if (status === 401) {
          setMessage('❌ Authentication required. Please login as an admin to load cheque receipt records.');
        } else if (status === 403) {
          setMessage('❌ Admin access required to load cheque receipt records.');
        } else {
          setMessage(`❌ Failed to load cheque receipt records: ${errorData.detail || 'Server error'} (Status: ${status})`);
        }
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        setMessage('🔌 Unable to connect to server. Please ensure the backend is running.');
      } else {
        setMessage('⚠️ Network error occurred while loading cheque receipt records.');
      }
      
      setChequeRecords([]);
    } finally {
      setLoadingChequeRecords(false);
    }
  };

  const handleChequeRecordChange = (id: string, field: keyof ExtractRecord, value: string | number) => {
    setChequeRecords(prev => prev.map(record =>
      record.id === id
        ? { ...record, [field]: field === 'total' ? parseFloat(value as string) || 0 : value }
        : record
    ));
  };

  const addNewChequeRecord = () => {
    const newRecord: ExtractRecord = {
      id: `cheque-manual-${Date.now()}`,
      name: '',
      total: 0,
      description: ''
    };
    
    setChequeRecords(prev => [...prev, newRecord]);
  };

  const removeChequeRecord = (id: string) => {
    setChequeRecords(prev => prev.filter(record => record.id !== id));
  };

  // Signatory Handler Functions
  const handleSundaySignatoryChange = (id: string, field: keyof SundaySignatory, value: string | Date | null) => {
    setSundaySignatories(prev => prev.map(signatory =>
      signatory.id === id ? { ...signatory, [field]: value } : signatory
    ));
  };

  const handlePastorSignatoryChange = (id: string, field: keyof PastorSignatory, value: string | Date | null) => {
    setPastorSignatories(prev => prev.map(signatory =>
      signatory.id === id ? { ...signatory, [field]: value } : signatory
    ));
  };

  const addNewSundaySignatory = () => {
    const newSignatory: SundaySignatory = {
      id: `sunday-${Date.now()}`,
      name: '',
      signature: '',
      date: new Date()
    };
    setSundaySignatories(prev => [...prev, newSignatory]);
  };

  const removeSundaySignatory = (id: string) => {
    setSundaySignatories(prev => prev.filter(signatory => signatory.id !== id));
  };

  const addNewPastorSignatory = () => {
    const newSignatory: PastorSignatory = {
      id: `pastor-${Date.now()}`,
      title: '',
      name: '',
      signature: '',
      date: new Date()
    };
    setPastorSignatories(prev => [...prev, newSignatory]);
  };

  const removePastorSignatory = (id: string) => {
    setPastorSignatories(prev => prev.filter(signatory => signatory.id !== id));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Sunday Offertory Report
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter the count of each denomination collected during the Sunday offerings
        </Typography>

        {message && (
          <Alert 
            severity={message.includes('Please') ? 'error' : 'success'} 
            sx={{ mb: 3 }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ minWidth: '250px' }}>
                <DatePicker
                  label="Report Date *"
                  value={reportData.reportDate}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" color="primary">
                  Total Amount: {formatCurrency(totalCash)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>500 ×</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>200 ×</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>100 ×</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>50 ×</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>20 ×</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>10 ×</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Coins</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <DenominationRow
                  label="1st Offering"
                  offering={reportData.firstOffering}
                  offeringType="firstOffering"
                />
                <DenominationRow
                  label="Amount"
                  offering={reportData.firstOffering}
                  offeringType="firstOffering"
                  showAmounts={true}
                />
                <DenominationRow
                  label="2nd Offering"
                  offering={reportData.secondOffering}
                  offeringType="secondOffering"
                />
                <DenominationRow
                  label="Amount"
                  offering={reportData.secondOffering}
                  offeringType="secondOffering"
                  showAmounts={true}
                />
                <TableRow sx={{ backgroundColor: '#e8f5e8' }}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                    TOTAL CASH - A
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.2em', color: 'primary.main' }}>
                    {formatCurrency(totalCash)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Extract Records Section */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" color="primary">
              Cash Receipt Records for {reportData.reportDate ? reportData.reportDate.toLocaleDateString() : 'Selected Date'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={loadExtractRecords}
                disabled={!reportData.reportDate || loadingRecords}
                sx={{ minWidth: '140px' }}
              >
                {loadingRecords ? 'Loading...' : 'Load Cash Records'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={addNewExtractRecord}
                sx={{ minWidth: '100px' }}
              >
                Add New
              </Button>
            </Box>
          </Box>

          {loadingRecords ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">Loading receipt records...</Typography>
            </Box>
          ) : (
            <Paper sx={{ overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f0f7ff' }}>
                      <TableCell sx={{ fontWeight: 'bold', width: '80px' }} align="center">Sr.No</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: '200px' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '120px' }} align="center">Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '80px' }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.extractRecords.length > 0 ? (
                      reportData.extractRecords.map((record, index) => (
                        <TableRow key={record.id}>
                          <TableCell align="center">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              value={record.name}
                              onChange={(e) => handleExtractRecordChange(record.id, 'name', e.target.value)}
                              placeholder="Enter name"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <TextField
                              size="small"
                              type="number"
                              value={record.total || ''}
                              onChange={(e) => handleExtractRecordChange(record.id, 'total', e.target.value)}
                              placeholder="0"
                              sx={{ width: '100px' }}
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              multiline
                              rows={2}
                              value={record.description}
                              onChange={(e) => handleExtractRecordChange(record.id, 'description', e.target.value)}
                              placeholder="Enter description"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              color="error"
                              onClick={() => removeExtractRecord(record.id)}
                              sx={{ minWidth: 'auto', p: 1 }}
                            >
                              ×
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            {reportData.reportDate 
                              ? `No cash receipt records found for ${reportData.reportDate.toLocaleDateString()}`
                              : 'Select a report date to view cash receipt records'
                            }
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {reportData.extractRecords.length > 0 && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Total Cash Receipt Amount:</strong> {formatCurrency(
                  reportData.extractRecords.reduce((sum, record) => sum + (record.total || 0), 0)
                )}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Cheque Receipt Records Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Cheque Receipt Records for {reportData.reportDate?.toLocaleDateString() || 'Selected Date'}
          </Typography>

          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="small"
              onClick={loadExtractChequeRecords}
              disabled={!reportData.reportDate || loadingChequeRecords}
              sx={{ minWidth: '140px' }}
            >
              {loadingChequeRecords ? 'Loading...' : 'Load Cheque Records'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={addNewChequeRecord}
              sx={{ minWidth: '100px' }}
            >
              Add New
            </Button>
          </Box>

          {loadingChequeRecords ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">Loading cheque receipt records...</Typography>
            </Box>
          ) : (
            <Paper sx={{ overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                      <TableCell sx={{ fontWeight: 'bold', width: '80px' }} align="center">Sr.No</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: '200px' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '120px' }} align="center">Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '80px' }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chequeRecords.length > 0 ? (
                      chequeRecords.map((record, index) => (
                        <TableRow key={record.id}>
                          <TableCell align="center">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              value={record.name}
                              onChange={(e) => handleChequeRecordChange(record.id, 'name', e.target.value)}
                              placeholder="Enter name"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <TextField
                              size="small"
                              type="number"
                              value={record.total || ''}
                              onChange={(e) => handleChequeRecordChange(record.id, 'total', e.target.value)}
                              placeholder="0"
                              sx={{ width: '100px' }}
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              multiline
                              rows={2}
                              value={record.description}
                              onChange={(e) => handleChequeRecordChange(record.id, 'description', e.target.value)}
                              placeholder="Enter description"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              color="error"
                              onClick={() => removeChequeRecord(record.id)}
                              sx={{ minWidth: 'auto', p: 1 }}
                            >
                              ×
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            {reportData.reportDate 
                              ? `No cheque receipt records found for ${reportData.reportDate.toLocaleDateString()}`
                              : 'Select a report date to view cheque receipt records'
                            }
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {chequeRecords.length > 0 && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Total Cheque Receipt Amount:</strong> {formatCurrency(
                  chequeRecords.reduce((sum, record) => sum + (record.total || 0), 0)
                )}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Signatories Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Signatories
          </Typography>

          {/* Sunday Signatories */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="secondary">
                  Sunday Signatories
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={addNewSundaySignatory}
                  sx={{ minWidth: '100px' }}
                >
                  Add New
                </Button>
              </Box>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                      <TableCell sx={{ fontWeight: 'bold', width: '50px' }} align="center">Sr.No</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: '200px' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: '150px' }} align="center">Signature</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '160px' }} align="center">Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '80px' }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sundaySignatories.map((signatory, index) => (
                      <TableRow key={signatory.id}>
                        <TableCell align="center">
                          <Typography variant="body2">{index + 1}</Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={signatory.name}
                            onChange={(e) => handleSundaySignatoryChange(signatory.id, 'name', e.target.value)}
                            placeholder="Enter name"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            fullWidth
                            value={signatory.signature}
                            onChange={(e) => handleSundaySignatoryChange(signatory.id, 'signature', e.target.value)}
                            placeholder="Sign:"
                            sx={{ minWidth: '120px' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <DatePicker
                            value={signatory.date}
                            onChange={(newDate) => handleSundaySignatoryChange(signatory.id, 'date', newDate)}
                            slotProps={{
                              textField: {
                                size: 'small',
                                placeholder: 'Date:',
                                sx: { width: '140px' }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            color="error"
                            onClick={() => removeSundaySignatory(signatory.id)}
                            sx={{ minWidth: 'auto', p: 1 }}
                          >
                            ×
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Pastor Signatory */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="secondary">
                  Pastor Signatories
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={addNewPastorSignatory}
                  sx={{ minWidth: '100px' }}
                >
                  Add New
                </Button>
              </Box>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: '150px' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: '200px' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: '150px' }} align="center">Signature</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '160px' }} align="center">Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '80px' }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pastorSignatories.map((pastor) => (
                      <TableRow key={pastor.id}>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={pastor.title}
                            onChange={(e) => handlePastorSignatoryChange(pastor.id, 'title', e.target.value)}
                            placeholder="Enter title"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={pastor.name}
                            onChange={(e) => handlePastorSignatoryChange(pastor.id, 'name', e.target.value)}
                            placeholder="Enter name"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            fullWidth
                            value={pastor.signature}
                            onChange={(e) => handlePastorSignatoryChange(pastor.id, 'signature', e.target.value)}
                            placeholder="Sign:"
                            sx={{ minWidth: '120px' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <DatePicker
                            value={pastor.date}
                            onChange={(newDate) => handlePastorSignatoryChange(pastor.id, 'date', newDate)}
                            slotProps={{
                              textField: {
                                size: 'small',
                                placeholder: 'Date:',
                                sx: { width: '140px' }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            color="error"
                            onClick={() => removePastorSignatory(pastor.id)}
                            sx={{ minWidth: 'auto', p: 1 }}
                          >
                            ×
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={handleClear}
            sx={{ minWidth: '120px' }}
          >
            Clear Form
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ minWidth: '150px' }}
          >
            Save Report
          </Button>
          
          {/* Download dropdown - show when DOCX file is generated */}
          {generatedFiles && generatedFiles.docx_download_url && (
            <>
              <Button
                variant="outlined"
                color="success"
                onClick={(event) => setDownloadAnchorEl(event.currentTarget)}
                endIcon={<ArrowDropDown />}
                sx={{ minWidth: '140px' }}
                disabled={isGeneratingPdf}
              >
                Download {isGeneratingPdf ? 'PDF...' : 'Report'}
              </Button>
              <Menu
                anchorEl={downloadAnchorEl}
                open={Boolean(downloadAnchorEl)}
                onClose={() => setDownloadAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleDownload(generatedFiles.docx_filename!, generatedFiles.docx_download_url!);
                    setDownloadAnchorEl(null);
                  }}
                >
                  📄 Download DOCX
                </MenuItem>

                <MenuItem
                  onClick={handleGeneratePdfFromExistingDocx}
                  disabled={isGeneratingPdf}
                >
                  � {isGeneratingPdf ? 'Generating PDF...' : 'Generate & Download PDF'}
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> This form generates Sunday offertory reports based on the template format from "church/generate_sunday_report.py". 
            The report includes bag offertory collection (Section A), special offertory cash & cheque records (Sections B & C), 
            grand totals, and signatory sections.
          </Typography>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default SundayReportTab;