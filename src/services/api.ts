import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  LoginRequest,
  AuthToken,
  Collection,
  Receipt,
  BankReconciliation,
  DashboardStats,
  BibleVerse,
  EnvelopeDonation,
  CollectionStatistics,
  ExtractRecord,
  Expense,
  ExpenseCreate,
} from '../types';

class ApiService {
  // Extract cheque records for Sunday Report
  async getChequeExtractRecords(invoiceDate: string): Promise<any> {
    const response = await this.api.get(`/api/collections/cheque-records`, {
      params: { invoice_date: invoiceDate },
    });
    return response.data;
  }
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      console.log('API Request config:', config);
      
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.status, response.config.url);
        console.log('API Response data:', response.data);
        return response;
      },
      (error) => {
        console.error('API Error:', error);
        console.error('API Error config:', error.config);
        console.error('API Error response:', error.response);
        
        if (error.response?.status === 401) {
          // ...existing code...
        }
        return Promise.reject(error);
      }
    );
  }

  // Extract cash records for Sunday Report
  async getCashExtractRecords(invoiceDate: string): Promise<any> {
    const response = await this.api.get(`/api/collections/cash-records`, {
      params: { invoice_date: invoiceDate },
    });
    return response.data;
  }

  // Authentication endpoints
  async login(loginData: LoginRequest): Promise<AuthToken> {
    console.log('API Service - Login attempt:', loginData);
    console.log('API Service - Base URL:', this.baseURL);
    console.log('API Service - Full URL:', `${this.baseURL}/api/auth/login`);
    
    const response: AxiosResponse<AuthToken> = await this.api.post('/api/auth/login', loginData);
    console.log('API Service - Login response:', response.data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/api/auth/me');
    return response.data;
  }

  async verifyToken(): Promise<{ valid: boolean; user: User }> {
    const response = await this.api.post('/api/auth/verify-token');
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/api/auth/logout');
  }

  // Collection endpoints
  async getCollections(limit: number = 50): Promise<Collection[]> {
    const response: AxiosResponse<Collection[]> = await this.api.get('/api/collections', {
      params: { limit },
    });
    return response.data;
  }

  async getCollection(collectionId: string): Promise<Collection> {
    const response: AxiosResponse<Collection> = await this.api.get(`/api/collections/${collectionId}`);
    return response.data;
  }

  async createCollection(collectionData: {
    collection_date: string;
    total_cash: number;
    envelope_donations: EnvelopeDonation[];
    notes?: string;
  }): Promise<Collection> {
    const response: AxiosResponse<Collection> = await this.api.post('/api/collections', collectionData);
    return response.data;
  }

  async updateCollection(collectionId: string, updateData: {
    total_cash?: number;
    envelope_donations?: EnvelopeDonation[];
    notes?: string;
    status?: 'draft' | 'finalized' | 'archived';
  }): Promise<Collection> {
    const response: AxiosResponse<Collection> = await this.api.put(`/api/collections/${collectionId}`, updateData);
    return response.data;
  }

  async getCollectionSummary(startDate?: string, endDate?: string): Promise<any> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await this.api.get('/api/collections/summary/stats', { params });
    return response.data;
  }

  async getExtractRecordsByDateRange(startDate: string, endDate: string): Promise<any> {
    console.log('API Service - Get extract records by date range:', startDate, endDate);
    const response = await this.api.get('/api/collections/extract-records', {
      params: { 
        start_date: startDate, 
        end_date: endDate 
      },
    });
    console.log('API Service - Extract records response:', response.data);
    return response.data;
  }

  // Receipt endpoints
  async generateReceipts(collectionId: string, generateAll: boolean = true): Promise<Receipt[]> {
    const response: AxiosResponse<Receipt[]> = await this.api.post('/api/receipts/generate', {
      collection_id: collectionId,
      generate_all: generateAll,
    });
    return response.data;
  }

  async getReceiptsForCollection(collectionId: string): Promise<Receipt[]> {
    const response: AxiosResponse<Receipt[]> = await this.api.get(`/api/receipts/collection/${collectionId}`);
    return response.data;
  }

  async getReceipt(receiptId: string): Promise<Receipt> {
    const response: AxiosResponse<Receipt> = await this.api.get(`/api/receipts/${receiptId}`);
    return response.data;
  }

  async downloadReceiptPDF(receiptId: string): Promise<Blob> {
    const response = await this.api.get(`/api/receipts/${receiptId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async downloadInvoiceReceiptPDF(receiptNumber: string): Promise<Blob> {
    const response = await this.api.get(`/api/invoices/download-receipt/${receiptNumber}`, {
      responseType: 'blob',
    });
    return response.data;
  }


  async getExtractRecordsByDate(invoiceDate: string): Promise<any> {
    console.log('API Service - Extract by date request:', invoiceDate);
    const response = await this.api.post('/api/receipts/extract-by-date', { 
      invoiceDate 
    });
    console.log('API Service - Extract response:', response.data);
    return response.data;
  }

  async getExtractChequeRecordsByDate(invoiceDate: string): Promise<any> {
    console.log('API Service - Extract cheque by date request:', invoiceDate);
    const response = await this.api.post('/api/receipts/extract-cheque-by-date', { 
      invoiceDate 
    });
    console.log('API Service - Extract cheque response:', response.data);
    return response.data;
  }

  // Sunday Report endpoints
  async generateSundayReport(reportData: any): Promise<any> {
    console.log('API Service - Generate Sunday report request:', reportData);
    const response = await this.api.post('/api/sunday-reports/generate', reportData);
    console.log('API Service - Generate Sunday report response:', response.data);
    return response.data;
  }

  async downloadSundayReportFile(downloadUrl: string): Promise<Blob> {
    console.log('API Service - Download Sunday report file:', downloadUrl);
    const response = await this.api.get(downloadUrl, {
      responseType: 'blob',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    console.log(`API Service - Downloaded ${response.data.size} bytes`);
    return response.data;
  }

  async generateSundayReportPdf(reportData: any): Promise<any> {
    console.log('API Service - Generate Sunday report PDF request:', reportData);
    const response = await this.api.post('/api/sunday-reports/generate-pdf', reportData);
    console.log('API Service - Generate Sunday report PDF response:', response.data);
    return response.data;
  }

  async convertDocxToPdf(docxFilename: string): Promise<any> {
    console.log('API Service - Convert DOCX to PDF request:', docxFilename);
    const response = await this.api.post('/api/sunday-reports/convert-docx-to-pdf', {
      docx_filename: docxFilename
    });
    console.log('API Service - Convert DOCX to PDF response:', response.data);
    return response.data;
  }

  // Reconciliation endpoints
  async uploadBankStatement(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.api.post('/api/reconciliation/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async createReconciliation(reconciliationData: {
    statement_date: string;
    bank_name?: string;
    account_number?: string;
    statement_period_start: string;
    statement_period_end: string;
    ending_balance?: number;
    csv_file_content: string;
    notes?: string;
  }): Promise<BankReconciliation> {
    const response: AxiosResponse<BankReconciliation> = await this.api.post('/api/reconciliation', reconciliationData);
    return response.data;
  }

  async getReconciliations(limit: number = 20): Promise<BankReconciliation[]> {
    const response: AxiosResponse<BankReconciliation[]> = await this.api.get('/api/reconciliation', {
      params: { limit },
    });
    return response.data;
  }

  async getReconciliation(reconciliationId: string): Promise<BankReconciliation> {
    const response: AxiosResponse<BankReconciliation> = await this.api.get(`/api/reconciliation/${reconciliationId}`);
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats(periodDays: number = 30): Promise<DashboardStats> {
    const response: AxiosResponse<DashboardStats> = await this.api.get('/api/dashboard/stats', {
      params: { period_days: periodDays },
    });
    return response.data;
  }

  async getRecentCollections(limit: number = 10): Promise<any[]> {
    const response = await this.api.get('/api/dashboard/recent-collections', {
      params: { limit },
    });
    return response.data;
  }

  async getCollectionTrends(months: number = 12): Promise<any> {
    const response = await this.api.get('/api/dashboard/collection-trends', {
      params: { months },
    });
    return response.data;
  }

  async getCollectionStatistics(startDate: string, endDate: string): Promise<CollectionStatistics> {
    const response = await this.api.get('/api/dashboard/collection-statistics', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  }

  async getDailyBibleVerse(): Promise<BibleVerse> {
    const response: AxiosResponse<BibleVerse> = await this.api.get('/api/bible-verse');
    return response.data;
  }

  // Expense Management
  async createExpense(expenseData: ExpenseCreate): Promise<Expense> {
    const response: AxiosResponse<Expense> = await this.api.post('/api/expenses/', expenseData);
    return response.data;
  }

  async getExpenses(startDate?: string, endDate?: string, category?: string): Promise<Expense[]> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (category) params.category = category;
    
    const response: AxiosResponse<Expense[]> = await this.api.get('/api/expenses/', { params });
    return response.data;
  }

  async getExpense(expenseId: string): Promise<Expense> {
    const response: AxiosResponse<Expense> = await this.api.get(`/api/expenses/${expenseId}`);
    return response.data;
  }

  async updateExpense(expenseId: string, expenseData: Partial<ExpenseCreate>): Promise<Expense> {
    const response: AxiosResponse<Expense> = await this.api.put(`/api/expenses/${expenseId}`, expenseData);
    return response.data;
  }

  async deleteExpense(expenseId: string): Promise<void> {
    await this.api.delete(`/api/expenses/${expenseId}`);
  }

  async uploadExpenseDocument(file: File, receiptNumber: string, expenseDate: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('receipt_number', receiptNumber);
    formData.append('expense_date', expenseDate);
    
    const response = await this.api.post('/api/expenses/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Generic HTTP methods for components
  async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }
}

const apiService = new ApiService();
export default apiService;