import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ReportsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

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

  // Initialize date range to current financial year
  useEffect(() => {
    const financialYearStart = `2025-09-30`;
    const financialYearEnd = `${endYear}-03-31`;
    setStartDate(financialYearStart);
    setEndDate(financialYearEnd);
  }, [startYear, endYear]);

  const handleReportClick = (reportType: string) => {
    setSelectedReport(reportType);
    console.log(`Generating ${reportType} report from ${startDate} to ${endDate}...`);
    // TODO: Implement actual report generation logic with date range
  };

  if (!isAdmin) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Reports
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Access Denied: Admin privileges required to view reports.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      
  {/* Financial Year Reports Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Financial Year (30-Sep-2025 to 31-Mar-2026)
        </Typography>
        
        <Paper sx={{ p: 3, mt: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Date Range for Reports
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mt: 2, 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'flex-start' 
          }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{ flex: 1, minWidth: 200 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ flex: 1, minWidth: 200 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Selected Range: {startDate ? new Date(startDate).toLocaleDateString('en-IN') : 'Not set'} to {endDate ? new Date(endDate).toLocaleDateString('en-IN') : 'Not set'}
          </Typography>
        </Paper>

        {/* Main Frequently Used Reports */}
        <Paper sx={{ p: 3, mt: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            Main Audit Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click to generate frequently used audit reports
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant={selectedReport === 'audit_income_main' ? 'contained' : 'outlined'}
              size="large"
              sx={{ 
                minWidth: 250, 
                py: 3, 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
              onClick={() => handleReportClick('audit_income_main')}
            >
              Income Report
            </Button>
            
            <Button
              variant={selectedReport === 'audit_expense_main' ? 'contained' : 'outlined'}
              size="large"
              sx={{ 
                minWidth: 250, 
                py: 3, 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
              onClick={() => handleReportClick('audit_expense_main')}
            >
              Expense Report
            </Button>
            
            <Button
              variant={selectedReport === 'audit_assets_liabilities_main' ? 'contained' : 'outlined'}
              size="large"
              sx={{ 
                minWidth: 250, 
                py: 3, 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
              onClick={() => handleReportClick('audit_assets_liabilities_main')}
            >
              Assets & Liabilities Report
            </Button>
          </Box>
        </Paper>
        
        {/* Church Level Income Reports Section */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Church Level Income Reports
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant={selectedReport === 'all' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('all')}
          >
            All Report
          </Button>
          
          <Button
            variant={selectedReport === 'tithe' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('tithe')}
          >
            Tithe Report
          </Button>
          
          <Button
            variant={selectedReport === 'membership' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('membership')}
          >
            Membership Report
          </Button>
          
          <Button
            variant={selectedReport === 'st_stephen' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('st_stephen')}
          >
            St. Stephen Report
          </Button>
          
          <Button
            variant={selectedReport === 'mission' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('mission')}
          >
            Mission & Evangelism Report
          </Button>
          
          <Button
            variant={selectedReport === 'income_trends_analysis' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('income_trends_analysis')}
          >
            Income Trends Analysis
          </Button>
        </Box>

        {selectedReport && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              {/* Main Audit Reports */}
              {selectedReport === 'audit_income_main' && 'Income Report'}
              {selectedReport === 'audit_expense_main' && 'Expense Report'}
              {selectedReport === 'audit_assets_liabilities_main' && 'Assets & Liabilities Report'}
              
              {/* Church Level Income Reports */}
              {selectedReport === 'all' && 'All Report'}
              {selectedReport === 'tithe' && 'Tithe Report'}
              {selectedReport === 'membership' && 'Membership Report'}
              {selectedReport === 'st_stephen' && 'St. Stephen Report'}
              {selectedReport === 'mission' && 'Mission & Evangelism Report'}
              {selectedReport === 'income_trends_analysis' && 'Income Trends Analysis Report'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Report generation for {selectedReport} is in progress...
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              This will generate a comprehensive report for the financial year period from April {startYear} to March {endYear}.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ReportsPage;