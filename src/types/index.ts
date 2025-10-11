export interface User {
  id: string;
  phone_number: string;
  name?: string;
  role: 'member' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  phone_number: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
  expires_in: number;
}

export interface Collection {
  id: string;
  collection_date: string;
  total_cash: number;
  envelope_donations: EnvelopeDonation[];
  total_envelope_cash: number;
  total_envelope_cheques: number;
  total_collection: number;
  status: 'draft' | 'finalized' | 'archived';
  created_by: string;
  created_at: string;
  finalized_at?: string;
  notes?: string;
  receipt_count: number;
}

export interface EnvelopeDonation {
  envelope_number?: string;
  donor_name?: string;
  donor_phone?: string;
  amount: number;
  donation_type: 'cash' | 'envelope_cash' | 'envelope_cheque' | 'online';
  cheque_number?: string;
  bank_name?: string;
  notes?: string;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  collection_id: string;
  envelope_number?: string;
  donor_name: string;
  donor_phone?: string;
  donation_amount: number;
  donation_type: string;
  donation_date: string;
  cheque_number?: string;
  bank_name?: string;
  pdf_url?: string;
  status: 'generated' | 'sent' | 'failed';
  generated_at: string;
  notes?: string;
}

export interface BankReconciliation {
  id: string;
  statement_date: string;
  bank_name?: string;
  account_number?: string;
  statement_period_start: string;
  statement_period_end: string;
  total_deposits: number;
  total_withdrawals: number;
  ending_balance?: number;
  matched_count: number;
  unmatched_deposits_count: number;
  unmatched_collections_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  notes?: string;
}

export interface DashboardStats {
  period: {
    start_date: string;
    end_date: string;
    days: number;
    financial_year?: string;
  };
  collections: {
    total_collections: number;
    total_collections_amount: number;  // New field for Cosmos DB total
    total_expenditure: number;  // Keep for backward compatibility
    total_cash: number;
    total_cheques: number;
    average_collection: number;
  };
  receipts: {
    total_receipts: number;
    receipts_this_week: number;
  };
  reconciliation: {
    completed_reconciliations: number;
    last_reconciliation_date?: string;
  };
}

export interface CollectionStatistics {
  total_collection: number;
  cash_collection: number;
  online_collection: number;
  general_contributions: {
    tithe: number;
    membership: number;
    birthday: number;
    wedding: number;
    special_thanks: number;
    others: number;
  };
  st_stephen_social_aid_fund: number;
  mission_and_evangelism_fund: number;
}

export interface BibleVerse {
  verse: string;
  reference: string;
  date: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}