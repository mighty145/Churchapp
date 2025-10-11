import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Container
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import FileUploadTab from '../components/receipts/FileUploadTab';
import ManualEntryTab from '../components/receipts/ManualEntryTab';
import SundayReportTab from '../components/receipts/SundayReportTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`receipts-tabpanel-${index}`}
      aria-labelledby={`receipts-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ReceiptsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <Container>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You need administrator privileges to access receipt management.
          </Typography>
        </Paper>
      </Container>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Receipt Management
      </Typography>
      
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="receipt management tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Upload & Process" id="receipts-tab-0" />
          <Tab label="Manual Entry" id="receipts-tab-1" />
          <Tab label="Sunday Report" id="receipts-tab-2" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <FileUploadTab />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <ManualEntryTab />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <SundayReportTab />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ReceiptsPage;