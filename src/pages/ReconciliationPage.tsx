import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ReconciliationPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bank Reconciliation
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Bank reconciliation interface coming soon...
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          This admin-only page will allow:
          <br />• Upload bank statement CSV files
          <br />• Automatically match deposits with recorded donations
          <br />• View reconciliation reports
          <br />• Identify unmatched transactions
          <br />• Generate reconciliation summaries
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReconciliationPage;