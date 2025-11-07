import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { numberToWords } from '../utils/numberToWords';

interface Expense {
  id: string;
  date: string;
  category: string;
  sub_category?: string;
  audit_category?: string;
  audit_account_head?: string;
  description: string;
  amount: number;
  payment_mode: 'cash' | 'cheque' | 'online';
  vendor?: string;
  receipt_number?: string;
  payment_cleared_date?: string;
  payment_status?: string;
  receipt_available?: string;
  expense_account?: string;
  notes?: string;
  document_urls?: string[];
  created_by: string;
  created_at: string;
}

const ExpensesPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [expenseAccountFilter, setExpenseAccountFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [receiptAvailableFilter, setReceiptAvailableFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  
  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedDocUrls, setUploadedDocUrls] = useState<string[]>([]);
  
  // Documents viewer state
  const [openDocumentsDialog, setOpenDocumentsDialog] = useState(false);
  const [viewingDocuments, setViewingDocuments] = useState<string[]>([]);
  const [viewingExpenseId, setViewingExpenseId] = useState<string>('');
  
  // Form fields
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    sub_category: '',
    audit_category: '',
    audit_account_head: '',
    description: '',
    amount: '',
    payment_mode: 'cash' as 'cash' | 'cheque' | 'online',
    vendor: '',
    receipt_number: '',
    payment_cleared_date: '',
    payment_status: '',
    receipt_available: '',
    expense_account: '',
    notes: '',
  });

  // Expense categories
  const categories = [
    'Pastoral Support & Church Admin',
    'Property and Pastoral Charge',
    'Mission & Evangelism',
    'Committee on Social Concerns',
    'Christian Education & Nurture',
    'Church Membership & Records',
    'Others',
  ];

  // Sub-categories for Pastoral Support & Church Admin
  const pastoralSubCategories = [
    'Remuneration to Pastors',
    'Contribution to Co-ordination Comm.',
    'Contribution for Maintenance-Sunday School room',
    'Printing & Stationery',
    'Postage',
    'Holy Communion',
    'Honorariums',
    'Church Renovation / Upgradation',
    'Church cemetery',
    'Christmas - Gift to Church staff',
    'Special grant for Anil',
    'Church Fellowship / Refreshment expenses',
    'Other Special / Festival days expenses',
    'Church Building Donations + Gen Assistance Fund',
    'Dist. & Reg Conference Reg',
    'District Contribution (MYF, WSCS, Lay activities, etc.)',
    'Travelling expenses (Choir, Minister, Members)',
    'Audit Fees',
    'Other / Miscellaneous expenses',
  ];

  // Sub-categories for Property and Pastoral Charge
  const propertySubCategories = [
    'Repair & Maintenance',
    'Property Tax',
    'Maintenance',
    'Telephone / Internet',
    'Electricity [R]',
    'Musical Instruments/Accessories/Repair',
  ];

  // Sub-categories for Mission & Evangelism
  const missionSubCategories = [
    'Retreats & Seminars [Minister, Members]',
    'Revival Meeting',
    'Outreach Programmes',
    'Mission Field visit',
    'Donation to Organisations (incl BSI, IEM, Gideons)',
    'Missionary Support(Local)',
    'Missionary Support (BRC)+Home Mission+Child Care+ Methodist Mission Movt',
    'Theological students(Practical Ministry) UBS',
    'Theological student sponsorship(LTC)',
    'Aid for scholarship',
    'Aid for Lausanne Conference',
    'Theological student sponsorship(Others)',
  ];

  // Sub-categories for Committee on Social Concerns
  const socialConcernsSubCategories = [
    'St. Stephens Social Aid-Education',
    'St. Stephens Social Aid- Medical',
    'Special Sundays (Mothers Day/Fathers Day/Teachers/Clergy/Children)',
    'Christmas - Golden Group Gifts',
    'Harvest Festival',
    'Christmas Tree Party- Church Gifts',
    'Christmas Carol Expenses',
    'Christmas Tree Party,Dinner Expenses',
  ];

  // Sub-categories for Christian Education & Nurture
  const educationSubCategories = [
    'Vacation Bible School (V.B.S.)',
    'Sunday School Retreat',
    'Sunday School Inter Church Event',
    'Excellency Awards',
    'Christian Education & Nurture (Committee Progs)',
    'Jackson Memorial Fund(Only for 10th/12th student with highest marks)',
  ];

  // Sub-categories for Church Membership & Records
  const membershipSubCategories = [
    'Wedding and birthday cards - cakes',
    'Welcome cards for new worshippers',
    'Website making',
  ];

  // Sub-categories for Others
  const othersSubCategories = [
    'Others',
  ];

  // Audit Categories
  const auditCategories = [
    'OUTREACH EXPENSES',
    'CHURCH SERVICE EXPENSES',
    'ACTIVITY EXPENSES',
    'ADMINISTRATION EXPENSES',
    'CONTRA ENTRIES',
    'OTHERS',
  ];

  // Audit Account Heads for OUTREACH EXPENSES
  const outreachAccountHeads = [
    'Missionary Work',
    'Evangelical Work',
    'Socio-Economic Welfare',
    'Aid to Poor & Needy',
    'Education Expenses',
    'Medical Assistances',
  ];

  // Audit Account Heads for CHURCH SERVICE EXPENSES
  const churchServiceAccountHeads = [
    'Holy Communion Expenses',
    'Choir Expenses',
    'Church Day',
    'Christmas Celebrations',
    'New Year Celebrations',
    'Easter Celebrations',
    'Harvest Festival',
    'Sunday School Expenses',
    'MYF Expenses',
    'WSCS EXPENSES',
    'Methodist Men\'s Fellowship Expenses',
    'Vacation Bible School Expenses',
    'Rent, Rates and Taxes',
    'Repair and Maintenance - Buildings',
    'Repair and Maintenance- Equipment\'s',
    'Electricity Charges',
    'Water Charges',
    'Website Expense',
  ];

  // Audit Account Heads for ACTIVITY EXPENSES
  const activityAccountHeads = [
    'Remuneration to Pastors',
    'Parsonage Expenses',
    'Honorarium',
    'Programmes and Activities',
    'Travelling',
    'Conveyance',
    'Conference Expenses',
    'Committee Meeting Expenses',
    'Contribution to MCI',
    'Sale of Work Expenses',
  ];

  // Audit Account Heads for ADMINISTRATION EXPENSES
  const administrationAccountHeads = [
    'Salaries and Allowances',
    'Food and Refreshment Expenses',
    'Rent Rates and Taxes',
    'Repair and Maintenance - Buildings',
    'Repair and Maintenance- Equipment\'s',
    'Electricity Charges',
    'Water Charges',
    'Books and Periodicals',
    'Printing & Stationery',
    'Postage & Courier',
    'Telephone, Mobile & Internet Expense',
    'Audit Fees',
    'Professional Fees',
    'Legal Expenses',
    'Assets Written Off',
    'General Expenses',
    'Bank Charges',
  ];

  // Audit Account Heads for CONTRA ENTRIES
  const contraEntriesAccountHeads = [
    'Contributions to CART',
    'Contributions to Coordination Committee',
  ];

  // Audit Account Heads for OTHERS
  const othersAccountHeads = [
    'OTHERS',
  ];

  // Expense Bank Accounts
  const expenseBankAccounts = [
    'CART MRC MC Methodist English Church Kirkee',
    'CART MRC MC Methodist English Church Kirkee EMF',
    'CART MRC MC Methodist English Church Kirkee CF',
  ];

  // Initialize date range (30-Sep-2025 to current date by default)
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based (September = 8)
    
    // Calculate financial year start year
    let fyStartYear;
    if (currentMonth >= 8) { // September (8) onwards - current financial year
      fyStartYear = currentYear;
    } else { // January to August - previous financial year
      fyStartYear = currentYear - 1;
    }
    
    const startDateString = `${fyStartYear}-09-30`; // 30th September
    const endDateString = today.toISOString().split('T')[0];
    
    setStartDate(startDateString);
    setEndDate(endDateString);
  }, []);

  // Fetch expenses (placeholder - integrate with your API)
  useEffect(() => {
    if (startDate && endDate) {
      fetchExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await apiService.getExpenses(startDate, endDate);
      setExpenses(data);
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      setSnackbar({
        open: true,
        message: `Failed to fetch expenses: ${error.response?.data?.detail || error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        date: expense.date,
        category: expense.category,
        sub_category: expense.sub_category || '',
        audit_category: expense.audit_category || '',
        audit_account_head: expense.audit_account_head || '',
        description: expense.description,
        amount: expense.amount.toString(),
        payment_mode: expense.payment_mode,
        vendor: expense.vendor || '',
        receipt_number: expense.receipt_number || '',
        payment_cleared_date: expense.payment_cleared_date || '',
        payment_status: expense.payment_status || '',
        receipt_available: expense.receipt_available || '',
        expense_account: expense.expense_account || '',
        notes: expense.notes || '',
      });
      // Set existing document URLs if available
      setUploadedDocUrls(expense.document_urls || []);
    } else {
      setEditingExpense(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        sub_category: '',
        audit_category: '',
        audit_account_head: '',
        description: '',
        amount: '',
        payment_mode: 'cash',
        vendor: '',
        receipt_number: '',
        payment_cleared_date: '',
        payment_status: '',
        receipt_available: '',
        expense_account: '',
        notes: '',
      });
      setUploadedDocUrls([]);
    }
    setSelectedFiles([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpense(null);
    setSelectedFiles([]);
    setUploadedDocUrls([]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      // Validate file types
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const validFiles = files.filter(file => allowedTypes.includes(file.type));
      
      if (validFiles.length !== files.length) {
        setSnackbar({
          open: true,
          message: 'Some files were skipped. Only images, PDF, and DOCX files are allowed.',
          severity: 'error',
        });
      }
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewDocuments = (expense: Expense) => {
    if (expense.document_urls && expense.document_urls.length > 0) {
      setViewingDocuments(expense.document_urls);
      setViewingExpenseId(expense.id);
      setOpenDocumentsDialog(true);
    } else {
      setSnackbar({
        open: true,
        message: 'No documents attached to this expense.',
        severity: 'info',
      });
    }
  };

  const handleCloseDocumentsDialog = () => {
    setOpenDocumentsDialog(false);
    setViewingDocuments([]);
    setViewingExpenseId('');
  };

  const handleFormChange = (field: string, value: any) => {
    // If category changes, clear sub-category if it's not a category with predefined sub-categories
    if (field === 'category' && 
        value !== 'Pastoral Support & Church Admin' && 
        value !== 'Property and Pastoral Charge' &&
        value !== 'Mission & Evangelism' &&
        value !== 'Committee on Social Concerns' &&
        value !== 'Christian Education & Nurture' &&
        value !== 'Church Membership & Records' &&
        value !== 'Others') {
      setFormData({ ...formData, [field]: value, sub_category: '' });
    } else if (field === 'audit_category') {
      // Clear audit_account_head when audit_category changes
      setFormData({ ...formData, [field]: value, audit_account_head: '' });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Upload files first if any are selected
      const documentUrls: string[] = [...uploadedDocUrls];
      if (selectedFiles.length > 0) {
        const receiptNumber = formData.receipt_number || 'NO_RECEIPT';
        const expenseDate = formData.date;
        
        for (const file of selectedFiles) {
          try {
            const uploadResult = await apiService.uploadExpenseDocument(file, receiptNumber, expenseDate);
            if (uploadResult.url) {
              documentUrls.push(uploadResult.url);
            }
          } catch (uploadError: any) {
            console.error('Error uploading file:', uploadError);
            setSnackbar({
              open: true,
              message: `Failed to upload ${file.name}: ${uploadError.response?.data?.detail || uploadError.message}`,
              severity: 'error',
            });
          }
        }
      }
      
      // Prepare data for submission
      const expenseData = {
        date: formData.date,
        category: formData.category,
        sub_category: formData.sub_category || undefined,
        audit_category: formData.audit_category || undefined,
        audit_account_head: formData.audit_account_head || undefined,
        description: formData.description,
        amount: parseFloat(formData.amount),
        payment_mode: formData.payment_mode,
        vendor: formData.vendor || undefined,
        receipt_number: formData.receipt_number || undefined,
        payment_cleared_date: formData.payment_cleared_date || undefined,
        payment_status: formData.payment_status || undefined,
        receipt_available: formData.receipt_available || undefined,
        expense_account: formData.expense_account || undefined,
        notes: formData.notes || undefined,
        document_urls: documentUrls.length > 0 ? documentUrls : undefined,
      };
      
      if (editingExpense) {
        await apiService.updateExpense(editingExpense.id, expenseData);
        setSnackbar({
          open: true,
          message: 'Expense updated successfully!',
          severity: 'success',
        });
      } else {
        await apiService.createExpense(expenseData);
        setSnackbar({
          open: true,
          message: 'Expense created successfully!',
          severity: 'success',
        });
      }
      
      handleCloseDialog();
      fetchExpenses();
    } catch (error: any) {
      console.error('Error submitting expense:', error);
      setSnackbar({
        open: true,
        message: `Failed to save expense: ${error.response?.data?.detail || error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        setLoading(true);
        await apiService.deleteExpense(expenseId);
        setSnackbar({
          open: true,
          message: 'Expense deleted successfully!',
          severity: 'success',
        });
        fetchExpenses();
      } catch (error: any) {
        console.error('Error deleting expense:', error);
        setSnackbar({
          open: true,
          message: `Failed to delete expense: ${error.response?.data?.detail || error.message}`,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Download filtered expenses as CSV
  const handleDownloadReport = () => {
    try {
      // Create CSV header
      const headers = [
        'Date',
        'Category',
        'Sub Category',
        'Audit Category',
        'Audit Account Head',
        'Description',
        'Payee/Vendor',
        'Payment Mode',
        'Amount',
        'Receipt Number',
        'Payment Status',
        'Payment Cleared Date',
        'Receipt Available',
        'Expense Account',
        'Notes',
      ];

      // Create CSV rows
      const rows = filteredExpenses.map(expense => [
        expense.date,
        expense.category || '',
        expense.sub_category || '',
        expense.audit_category || '',
        expense.audit_account_head || '',
        expense.description || '',
        expense.vendor || '',
        expense.payment_mode || '',
        expense.amount?.toString() || '0',
        expense.receipt_number || '',
        expense.payment_status || '',
        expense.payment_cleared_date || '',
        expense.receipt_available || '',
        expense.expense_account || '',
        expense.notes || '',
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Generate filename with date range
      const filename = `Expense_Report_${startDate}_to_${endDate}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({
        open: true,
        message: 'Expense report downloaded successfully',
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Error downloading report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download report',
        severity: 'error',
      });
    }
  };

  // Filter expenses based on expense account and payment status
  const filteredExpenses = expenses.filter(exp => {
    if (expenseAccountFilter && expenseAccountFilter !== '') {
      if (exp.expense_account !== expenseAccountFilter) {
        return false;
      }
    }
    if (paymentStatusFilter && paymentStatusFilter !== '') {
      if (exp.payment_status !== paymentStatusFilter) {
        return false;
      }
    }
    if (receiptAvailableFilter && receiptAvailableFilter !== '') {
      if (exp.receipt_available !== receiptAvailableFilter) {
        return false;
      }
    }
    return true;
  });

  // Calculate statistics based on filtered expenses
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const cashExpenses = filteredExpenses
    .filter(exp => exp.payment_mode === 'cash')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const onlineExpenses = filteredExpenses
    .filter(exp => exp.payment_mode === 'online' || exp.payment_mode === 'cheque')
    .reduce((sum, exp) => sum + exp.amount, 0);

  if (!isAdmin) {
    return (
      <Container>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You need administrator privileges to access expense management.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Expense Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage church expenses
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Filter by Bank Account</InputLabel>
          <Select
            value={expenseAccountFilter}
            onChange={(e) => setExpenseAccountFilter(e.target.value)}
            label="Filter by Bank Account"
          >
            <MenuItem value="">
              <em>All Accounts</em>
            </MenuItem>
            <MenuItem value="CART MRC MC Methodist English Church Kirkee">
              CART MRC MC Methodist English Church Kirkee
            </MenuItem>
            <MenuItem value="CART MRC MC Methodist English Church Kirkee EMF">
              CART MRC MC Methodist English Church Kirkee EMF
            </MenuItem>
            <MenuItem value="CART MRC MC Methodist English Church Kirkee CF">
              CART MRC MC Methodist English Church Kirkee CF
            </MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Payment Status</InputLabel>
          <Select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            label="Filter by Payment Status"
          >
            <MenuItem value="">
              <em>All Status</em>
            </MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="cleared">Cleared</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Receipt Available</InputLabel>
          <Select
            value={receiptAvailableFilter}
            onChange={(e) => setReceiptAvailableFilter(e.target.value)}
            label="Filter by Receipt Available"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WalletIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Total Expenses
                </Typography>
              </Box>
              <Typography variant="h4">₹{totalExpenses.toFixed(2)}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem', mt: 0.5 }}>
                {numberToWords(totalExpenses)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filteredExpenses.length} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ReceiptIcon color="success" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Cash Expenses
                </Typography>
              </Box>
              <Typography variant="h4">₹{cashExpenses.toFixed(2)}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem', mt: 0.5 }}>
                {numberToWords(cashExpenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Online Expenses
                </Typography>
              </Box>
              <Typography variant="h4">₹{onlineExpenses.toFixed(2)}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem', mt: 0.5 }}>
                {numberToWords(onlineExpenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Date Filter and Add Button */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReport}
            disabled={filteredExpenses.length === 0}
          >
            Download
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Expense
          </Button>
        </Box>
      </Paper>

      {/* Expenses Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Payee</TableCell>
              <TableCell>Payment Mode</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No expenses found for the selected date range
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id} hover>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip label={expense.category} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.vendor || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={expense.payment_mode.toUpperCase()} 
                      size="small" 
                      color={
                        expense.payment_mode === 'cash' ? 'success' : 
                        expense.payment_mode === 'online' ? 'info' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell align="right">₹{expense.amount.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(expense)}
                      title="Edit expense"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleViewDocuments(expense)}
                      disabled={!expense.document_urls || expense.document_urls.length === 0}
                      title="View attachments"
                    >
                      <AttachFileIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(expense.id)}
                      title="Delete expense"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleFormChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => handleFormChange('category', e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.category === 'Pastoral Support & Church Admin' ? (
              <FormControl fullWidth>
                <InputLabel>Sub-Category</InputLabel>
                <Select
                  value={formData.sub_category}
                  label="Sub-Category"
                  onChange={(e) => handleFormChange('sub_category', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {pastoralSubCategories.map((subCat) => (
                    <MenuItem key={subCat} value={subCat}>{subCat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : formData.category === 'Property and Pastoral Charge' ? (
              <FormControl fullWidth>
                <InputLabel>Sub-Category</InputLabel>
                <Select
                  value={formData.sub_category}
                  label="Sub-Category"
                  onChange={(e) => handleFormChange('sub_category', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {propertySubCategories.map((subCat) => (
                    <MenuItem key={subCat} value={subCat}>{subCat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : formData.category === 'Mission & Evangelism' ? (
              <FormControl fullWidth>
                <InputLabel>Sub-Category</InputLabel>
                <Select
                  value={formData.sub_category}
                  label="Sub-Category"
                  onChange={(e) => handleFormChange('sub_category', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {missionSubCategories.map((subCat) => (
                    <MenuItem key={subCat} value={subCat}>{subCat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : formData.category === 'Committee on Social Concerns' ? (
              <FormControl fullWidth>
                <InputLabel>Sub-Category</InputLabel>
                <Select
                  value={formData.sub_category}
                  label="Sub-Category"
                  onChange={(e) => handleFormChange('sub_category', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {socialConcernsSubCategories.map((subCat) => (
                    <MenuItem key={subCat} value={subCat}>{subCat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : formData.category === 'Christian Education & Nurture' ? (
              <FormControl fullWidth>
                <InputLabel>Sub-Category</InputLabel>
                <Select
                  value={formData.sub_category}
                  label="Sub-Category"
                  onChange={(e) => handleFormChange('sub_category', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {educationSubCategories.map((subCat) => (
                    <MenuItem key={subCat} value={subCat}>{subCat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : formData.category === 'Church Membership & Records' ? (
              <FormControl fullWidth>
                <InputLabel>Sub-Category</InputLabel>
                <Select
                  value={formData.sub_category}
                  label="Sub-Category"
                  onChange={(e) => handleFormChange('sub_category', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {membershipSubCategories.map((subCat) => (
                    <MenuItem key={subCat} value={subCat}>{subCat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : formData.category === 'Others' ? (
              <FormControl fullWidth>
                <InputLabel>Sub-Category</InputLabel>
                <Select
                  value={formData.sub_category}
                  label="Sub-Category"
                  onChange={(e) => handleFormChange('sub_category', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {othersSubCategories.map((subCat) => (
                    <MenuItem key={subCat} value={subCat}>{subCat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                label="Sub-Category"
                value={formData.sub_category}
                onChange={(e) => handleFormChange('sub_category', e.target.value)}
                fullWidth
              />
            )}

            <FormControl fullWidth>
              <InputLabel>Audit Category</InputLabel>
              <Select
                value={formData.audit_category}
                label="Audit Category"
                onChange={(e) => handleFormChange('audit_category', e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {auditCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.audit_category === 'OUTREACH EXPENSES' ? (
              <FormControl fullWidth>
                <InputLabel>Audit Account Head</InputLabel>
                <Select
                  value={formData.audit_account_head}
                  label="Audit Account Head"
                  onChange={(e) => handleFormChange('audit_account_head', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {outreachAccountHeads.map((head) => (
                    <MenuItem key={head} value={head}>{head}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : formData.audit_category === 'CHURCH SERVICE EXPENSES' ? (
              <FormControl fullWidth>
                <InputLabel>Audit Account Head</InputLabel>
                <Select
                  value={formData.audit_account_head}
                  label="Audit Account Head"
                  onChange={(e) => handleFormChange('audit_account_head', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {churchServiceAccountHeads.map((head) => (
                    <MenuItem key={head} value={head}>{head}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : formData.audit_category === 'ACTIVITY EXPENSES' ? (
              <FormControl fullWidth>
                <InputLabel>Audit Account Head</InputLabel>
                <Select
                  value={formData.audit_account_head}
                  label="Audit Account Head"
                  onChange={(e) => handleFormChange('audit_account_head', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {activityAccountHeads.map((head) => (
                    <MenuItem key={head} value={head}>{head}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : formData.audit_category === 'ADMINISTRATION EXPENSES' ? (
              <FormControl fullWidth>
                <InputLabel>Audit Account Head</InputLabel>
                <Select
                  value={formData.audit_account_head}
                  label="Audit Account Head"
                  onChange={(e) => handleFormChange('audit_account_head', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {administrationAccountHeads.map((head) => (
                    <MenuItem key={head} value={head}>{head}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : formData.audit_category === 'CONTRA ENTRIES' ? (
              <FormControl fullWidth>
                <InputLabel>Audit Account Head</InputLabel>
                <Select
                  value={formData.audit_account_head}
                  label="Audit Account Head"
                  onChange={(e) => handleFormChange('audit_account_head', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {contraEntriesAccountHeads.map((head) => (
                    <MenuItem key={head} value={head}>{head}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : formData.audit_category === 'OTHERS' ? (
              <FormControl fullWidth>
                <InputLabel>Audit Account Head</InputLabel>
                <Select
                  value={formData.audit_account_head}
                  label="Audit Account Head"
                  onChange={(e) => handleFormChange('audit_account_head', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {othersAccountHeads.map((head) => (
                    <MenuItem key={head} value={head}>{head}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                label="Audit Account Head"
                value={formData.audit_account_head}
                onChange={(e) => handleFormChange('audit_account_head', e.target.value)}
                fullWidth
              />
            )}

            <TextField
              label="Vendor/Payee"
              value={formData.vendor}
              onChange={(e) => handleFormChange('vendor', e.target.value)}
              fullWidth
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              fullWidth
              required
              multiline
              rows={2}
            />

            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleFormChange('amount', e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
              }}
            />

            <FormControl fullWidth required>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                value={formData.payment_mode}
                label="Payment Mode"
                onChange={(e) => handleFormChange('payment_mode', e.target.value)}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="cheque">Cheque</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Receipt/Cheque Number"
              value={formData.receipt_number}
              onChange={(e) => handleFormChange('receipt_number', e.target.value)}
              fullWidth
            />

            {formData.payment_mode === 'cheque' && (
              <TextField
                label="Cheque Cleared Date"
                type="date"
                value={formData.payment_cleared_date}
                onChange={(e) => handleFormChange('payment_cleared_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            )}

            <FormControl fullWidth>
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={formData.payment_status}
                label="Payment Status"
                onChange={(e) => handleFormChange('payment_status', e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cleared">Cleared</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Receipt Available</InputLabel>
              <Select
                value={formData.receipt_available}
                label="Receipt Available"
                onChange={(e) => handleFormChange('receipt_available', e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Expense Bank Account</InputLabel>
              <Select
                value={formData.expense_account}
                label="Expense Bank Account"
                onChange={(e) => handleFormChange('expense_account', e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {expenseBankAccounts.map((account) => (
                  <MenuItem key={account} value={account}>{account}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              fullWidth
              multiline
              rows={3}
            />

            {/* File Upload Section */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Upload Proof of Expense (Image, PDF, or DOCX)
              </Typography>
              
              {/* Show existing documents if editing */}
              {uploadedDocUrls.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Existing documents:
                  </Typography>
                  {uploadedDocUrls.map((url, index) => {
                    // Extract blob name from URL (before SAS token parameters)
                    const urlParts = url.split('?')[0]; // Remove SAS token
                    const blobName = urlParts.split('/').pop() || 'Document';
                    const fileName = decodeURIComponent(blobName); // Decode URL encoding
                    return (
                      <Chip
                        key={index}
                        label={fileName}
                        component="a"
                        href={url}
                        target="_blank"
                        clickable
                        icon={<AttachFileIcon />}
                        sx={{ m: 0.5 }}
                        size="small"
                        color="primary"
                      />
                    );
                  })}
                </Box>
              )}
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 1 }}
              >
                Choose Files
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*,.pdf,.docx"
                  onChange={handleFileSelect}
                />
              </Button>
              
              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    New files to upload:
                  </Typography>
                  {selectedFiles.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => handleRemoveFile(index)}
                      icon={<AttachFileIcon />}
                      sx={{ m: 0.5 }}
                      size="small"
                    />
                  ))}
                </Box>
              )}
              
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Files will be named as: Receipt/Cheque Number_Date_v1, v2, etc.
              </Typography>
            </Box>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            All expenses will be recorded for audit and reconciliation purposes.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading || !formData.date || !formData.category || !formData.description || !formData.amount}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {editingExpense ? 'Update' : 'Add'} Expense
          </Button>
        </DialogActions>
      </Dialog>

      {/* Documents Viewer Dialog */}
      <Dialog 
        open={openDocumentsDialog} 
        onClose={handleCloseDocumentsDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Attached Documents
          <Typography variant="caption" display="block" color="text.secondary">
            Expense ID: {viewingExpenseId}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {viewingDocuments.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center">
                No documents attached to this expense.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {viewingDocuments.map((url, index) => {
                  // Extract blob name from URL (before SAS token parameters)
                  const urlParts = url.split('?')[0]; // Remove SAS token
                  const blobName = urlParts.split('/').pop() || `Document ${index + 1}`;
                  const fileName = decodeURIComponent(blobName); // Decode URL encoding
                  const fileExt = fileName.split('.').pop()?.toLowerCase();
                  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '');
                  
                  return (
                    <Card key={index} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachFileIcon color="primary" />
                            <Typography variant="body1" fontWeight="medium">
                              {fileName}
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            component="a"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open
                          </Button>
                        </Box>
                        
                        {isImage && (
                          <Box 
                            component="img" 
                            src={url} 
                            alt={fileName}
                            sx={{ 
                              width: '100%', 
                              maxHeight: 400, 
                              objectFit: 'contain',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                            onError={(e: any) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        
                        {!isImage && (
                          <Box 
                            sx={{ 
                              p: 3, 
                              border: '1px dashed', 
                              borderColor: 'divider',
                              borderRadius: 1,
                              textAlign: 'center',
                              bgcolor: 'grey.50'
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {fileExt?.toUpperCase()} file - Click "Open" to view
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDocumentsDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ExpensesPage;
