import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const CollectionsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Collections
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Collections management interface coming soon...
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          This page will allow admins to:
          <br />• Create new Sunday collection reports
          <br />• Add cash and envelope donations
          <br />• Track cheque donations with bank details
          <br />• Finalize collections for receipt generation
        </Typography>
      </Paper>
    </Box>
  );
};

export default CollectionsPage;