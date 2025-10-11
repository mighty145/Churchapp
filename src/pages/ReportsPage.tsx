import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ReportsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
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
    const financialYearStart = `${startYear}-04-01`;
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
          Financial Year (Apr-{startYear} to Mar-{endYear})
        </Typography>
        
        {/* Date Range Picker */}
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
        
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Audit Income Reports
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* New Additional Reports */}
          <Button
            variant={selectedReport === 'offerings' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('offerings')}
          >
            Offerings
          </Button>
          
          <Button
            variant={selectedReport === 'donations' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('donations')}
          >
            Donations
          </Button>
          
          <Button
            variant={selectedReport === 'interest_income' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('interest_income')}
          >
            Interest Income
          </Button>
          
          <Button
            variant={selectedReport === 'other_income' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('other_income')}
          >
            Other Income
          </Button>
          
          <Button
            variant={selectedReport === 'sunday_school' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('sunday_school')}
          >
            Sunday School Income
          </Button>
          
          <Button
            variant={selectedReport === 'youth_fellowship' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('youth_fellowship')}
          >
            Methodist Youth Fellowship
          </Button>
          
          <Button
            variant={selectedReport === 'womens_society' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('womens_society')}
          >
            Women's Society of Christian Service
          </Button>
          
          <Button
            variant={selectedReport === 'mens_fellowship' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('mens_fellowship')}
          >
            Methodist Men's Fellowship
          </Button>
        </Box>

        {/* Audit Expense Reports Section */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Audit Expense Reports
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant={selectedReport === 'all_expenses' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('all_expenses')}
          >
            All Expenses
          </Button>
          
          <Button
            variant={selectedReport === 'outreach_expenses' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('outreach_expenses')}
          >
            Outreach Expenses
          </Button>
          
          <Button
            variant={selectedReport === 'church_service_expenses' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('church_service_expenses')}
          >
            Church Service Expenses
          </Button>
          
          <Button
            variant={selectedReport === 'activity_expenses' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('activity_expenses')}
          >
            Activity Expenses
          </Button>
          
          <Button
            variant={selectedReport === 'administration_expenses' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('administration_expenses')}
          >
            Administration Expenses
          </Button>
          
          <Button
            variant={selectedReport === 'contra_entries' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('contra_entries')}
          >
            Contra Entries
          </Button>
        </Box>

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
            variant={selectedReport === 'monthly_income_summary' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('monthly_income_summary')}
          >
            Monthly Income Summary
          </Button>
          
          <Button
            variant={selectedReport === 'quarterly_income_summary' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('quarterly_income_summary')}
          >
            Quarterly Income Summary
          </Button>
          
          <Button
            variant={selectedReport === 'annual_income_summary' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('annual_income_summary')}
          >
            Annual Income Summary
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

        {/* Church Level Expense Reports Section */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Church Level Expense Reports
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant={selectedReport === 'church_all_expense' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('church_all_expense')}
          >
            All Church Expenses
          </Button>
          
          <Button
            variant={selectedReport === 'church_monthly_expense' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('church_monthly_expense')}
          >
            Monthly Expense Summary
          </Button>
          
          <Button
            variant={selectedReport === 'church_quarterly_expense' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('church_quarterly_expense')}
          >
            Quarterly Expense Summary
          </Button>
          
          <Button
            variant={selectedReport === 'church_annual_expense' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('church_annual_expense')}
          >
            Annual Expense Summary
          </Button>
          
          <Button
            variant={selectedReport === 'church_expense_trends' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('church_expense_trends')}
          >
            Expense Trends Analysis
          </Button>

          <Button
            variant={selectedReport === 'church_budget_comparison' ? 'contained' : 'outlined'}
            size="large"
            sx={{ minWidth: 200, py: 2 }}
            onClick={() => handleReportClick('church_budget_comparison')}
          >
            Budget vs Actual Comparison
          </Button>
        </Box>

        {selectedReport && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              {/* Main Audit Reports */}
              {selectedReport === 'audit_income_main' && 'Income Report'}
              {selectedReport === 'audit_expense_main' && 'Expense Report'}
              {selectedReport === 'audit_assets_liabilities_main' && 'Assets & Liabilities Report'}
              
              {/* Audit Income Reports */}
              {selectedReport === 'offerings' && 'Offerings Report'}
              {selectedReport === 'donations' && 'Donations Report'}
              {selectedReport === 'interest_income' && 'Interest Income Report'}
              {selectedReport === 'other_income' && 'Other Income Report'}
              {selectedReport === 'sunday_school' && 'Sunday School Income Report'}
              {selectedReport === 'youth_fellowship' && 'Methodist Youth Fellowship Report'}
              {selectedReport === 'womens_society' && 'Women\'s Society of Christian Service Report'}
              {selectedReport === 'mens_fellowship' && 'Methodist Men\'s Fellowship Report'}
              
              {/* Audit Expense Reports */}
              {selectedReport === 'all_expenses' && 'All Expenses Report'}
              {selectedReport === 'outreach_expenses' && 'Outreach Expenses Report'}
              {selectedReport === 'church_service_expenses' && 'Church Service Expenses Report'}
              {selectedReport === 'activity_expenses' && 'Activity Expenses Report'}
              {selectedReport === 'administration_expenses' && 'Administration Expenses Report'}
              {selectedReport === 'contra_entries' && 'Contra Entries Report'}
              
              {/* Church Level Income Reports */}
              {selectedReport === 'all' && 'All Report'}
              {selectedReport === 'tithe' && 'Tithe Report'}
              {selectedReport === 'membership' && 'Membership Report'}
              {selectedReport === 'st_stephen' && 'St. Stephen Report'}
              {selectedReport === 'mission' && 'Mission & Evangelism Report'}
              {selectedReport === 'monthly_income_summary' && 'Monthly Income Summary Report'}
              {selectedReport === 'quarterly_income_summary' && 'Quarterly Income Summary Report'}
              {selectedReport === 'annual_income_summary' && 'Annual Income Summary Report'}
              {selectedReport === 'income_trends_analysis' && 'Income Trends Analysis Report'}
              
              {/* Church Level Expense Reports */}
              {selectedReport === 'church_all_expense' && 'All Church Expenses Report'}
              {selectedReport === 'church_monthly_expense' && 'Monthly Expense Summary Report'}
              {selectedReport === 'church_quarterly_expense' && 'Quarterly Expense Summary Report'}
              {selectedReport === 'church_annual_expense' && 'Annual Expense Summary Report'}
              {selectedReport === 'church_expense_trends' && 'Expense Trends Analysis Report'}
              {selectedReport === 'church_budget_comparison' && 'Budget vs Actual Comparison Report'}
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