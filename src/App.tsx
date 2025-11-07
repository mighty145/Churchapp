import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReceiptsPage from './pages/ReceiptsPage';
import ExpensesPage from './pages/ExpensesPage';
import ReconciliationPage from './pages/ReconciliationPage';
import ReportsPage from './pages/ReportsPage';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <WebSocketProvider>
            <Router>
              <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Layout>
                        <DashboardPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/receipts" element={
                    <ProtectedRoute>
                      <Layout>
                        <ReceiptsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/expenses" element={
                    <ProtectedRoute requireAdmin>
                      <Layout>
                        <ExpensesPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/reconciliation" element={
                    <ProtectedRoute requireAdmin>
                      <Layout>
                        <ReconciliationPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/reports" element={
                    <ProtectedRoute requireAdmin>
                      <Layout>
                        <ReportsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Redirect unknown routes to home */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Box>
            </Router>
          </WebSocketProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
