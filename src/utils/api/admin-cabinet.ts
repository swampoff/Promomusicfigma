/**
 * ADMIN CABINET API CLIENT
 * API для админ-панели:
 * - Финансы (payments)
 * - Тикеты поддержки (tickets-system)
 * - Общая статистика (stats)
 */

import { apiFetch } from './api-cache';

// =====================================================
// PAYMENTS / FINANCES
// =====================================================

const PAYMENTS_PREFIX = '/api/payments';
const TICKETS_PREFIX = '/tickets-system';

async function apiGet<T>(prefix: string, path: string): Promise<T | null> {
  try {
    const res = await apiFetch(prefix, path);
    if (!res.ok) {
      console.error(`Admin API error ${res.status} for ${prefix}${path}:`, await res.text().catch(() => ''));
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Admin API fetch error for ${prefix}${path}:`, error);
    return null;
  }
}

async function apiMutate<T>(prefix: string, path: string, method: string, body?: any): Promise<T | null> {
  try {
    const options: RequestInit = { method };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }
    const res = await apiFetch(prefix, path, options);
    if (!res.ok) {
      console.error(`Admin API error ${res.status} for ${method} ${prefix}${path}:`, await res.text().catch(() => ''));
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Admin API fetch error for ${method} ${prefix}${path}:`, error);
    return null;
  }
}

// ── Transactions ──────────────────────────────────────

export interface TransactionData {
  id: string;
  userId: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  status: string;
  metadata?: any;
  createdAt: string;
}

export async function fetchTransactions(
  userId: string,
  filters?: { type?: string; category?: string; status?: string; search?: string; limit?: number; offset?: number }
): Promise<TransactionData[]> {
  const params = new URLSearchParams({ user_id: userId });
  if (filters?.type) params.append('type', filters.type);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.offset) params.append('offset', String(filters.offset));
  
  const data = await apiGet<{ success: boolean; data: TransactionData[] }>(PAYMENTS_PREFIX, `/transactions?${params.toString()}`);
  return data?.data || [];
}

export async function createTransaction(params: {
  user_id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  metadata?: any;
}): Promise<string | null> {
  const data = await apiMutate<{ success: boolean; data: { transaction_id: string } }>(
    PAYMENTS_PREFIX, '/transactions', 'POST', params
  );
  return data?.data?.transaction_id || null;
}

// ── Balance & Stats ──────────────────────────────────

export interface BalanceData {
  available: number;
  pending: number;
  total: number;
  currency: string;
}

export async function fetchBalance(userId: string): Promise<BalanceData | null> {
  const data = await apiGet<{ success: boolean; data: BalanceData }>(PAYMENTS_PREFIX, `/balance?user_id=${userId}`);
  return data?.data || null;
}

export interface PaymentStatsData {
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  netBalance: number;
}

export async function fetchPaymentStats(userId: string): Promise<PaymentStatsData | null> {
  const data = await apiGet<{ success: boolean; data: PaymentStatsData }>(PAYMENTS_PREFIX, `/stats?user_id=${userId}`);
  return data?.data || null;
}

export interface CategoryStatData {
  category: string;
  total: number;
}

export async function fetchCategoryStats(userId: string, type: string, period?: string): Promise<CategoryStatData[]> {
  const params = new URLSearchParams({ user_id: userId, type });
  if (period) params.append('period', period);
  const data = await apiGet<{ success: boolean; data: CategoryStatData[] }>(PAYMENTS_PREFIX, `/category-stats?${params.toString()}`);
  return data?.data || [];
}

// ── Payment Methods ──────────────────────────────────

export interface PaymentMethodData {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  createdAt: string;
}

export async function fetchPaymentMethods(userId: string): Promise<PaymentMethodData[]> {
  const data = await apiGet<{ success: boolean; data: PaymentMethodData[] }>(PAYMENTS_PREFIX, `/payment-methods?user_id=${userId}`);
  return data?.data || [];
}

// ── Withdrawals ──────────────────────────────────────

export interface WithdrawalData {
  id: string;
  userId: string;
  amount: number;
  paymentMethodId: string;
  status: string;
  createdAt: string;
}

export async function fetchWithdrawals(userId: string, status?: string): Promise<WithdrawalData[]> {
  const params = new URLSearchParams({ user_id: userId });
  if (status) params.append('status', status);
  const data = await apiGet<{ success: boolean; data: WithdrawalData[] }>(PAYMENTS_PREFIX, `/withdrawals?${params.toString()}`);
  return data?.data || [];
}

// =====================================================
// TICKETS / SUPPORT
// =====================================================

export interface TicketData {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  user: any;
  messages: any[];
  tags: string[];
  assignedTo?: any;
  rating?: number;
  sla: any;
  created_at: string;
  updated_at: string;
}

export async function fetchUserTickets(userId: string): Promise<TicketData[]> {
  const data = await apiGet<{ success: boolean; data: TicketData[] }>(TICKETS_PREFIX, `/user/${userId}`);
  return data?.data || [];
}

export async function fetchTicket(ticketId: string): Promise<TicketData | null> {
  const data = await apiGet<{ success: boolean; data: TicketData }>(TICKETS_PREFIX, `/${ticketId}`);
  return data?.data || null;
}

// =====================================================
// ADMIN - ALL TRANSACTIONS (platform-wide)
// =====================================================

export async function fetchAllTransactions(
  filters?: { type?: string; category?: string; status?: string; search?: string; limit?: number; offset?: number }
): Promise<{ data: TransactionData[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.offset) params.append('offset', String(filters.offset));
  const qs = params.toString();
  const data = await apiGet<{ success: boolean; data: TransactionData[]; total: number }>(
    PAYMENTS_PREFIX, `/admin/transactions${qs ? `?${qs}` : ''}`
  );
  return { data: data?.data || [], total: data?.total || 0 };
}

// =====================================================
// ADMIN - ALL USERS WITH BALANCES
// =====================================================

export interface AdminUserBalance {
  id: string;
  name: string;
  email: string;
  balance: number;
  totalSpent: number;
  totalEarned: number;
  transactionsCount: number;
  lastTransaction: string | null;
  status: string;
}

export async function fetchAllUserBalances(): Promise<AdminUserBalance[]> {
  const data = await apiGet<{ success: boolean; data: AdminUserBalance[] }>(PAYMENTS_PREFIX, '/admin/users');
  return data?.data || [];
}

// =====================================================
// ADMIN - PLATFORM FINANCIAL STATS
// =====================================================

export interface AdminFinancialStats {
  totalIncome: number;
  totalExpense: number;
  totalRefund: number;
  netBalance: number;
  transactionCount: number;
  pendingCount: number;
  categoryBreakdown: { category: string; total: number }[];
  monthlyTrend: { month: string; income: number; expense: number; net: number }[];
}

export async function fetchAdminFinancialStats(): Promise<AdminFinancialStats | null> {
  const data = await apiGet<{ success: boolean; data: AdminFinancialStats }>(PAYMENTS_PREFIX, '/admin/stats');
  return data?.data || null;
}

// =====================================================
// ADMIN - ALL TICKETS (platform-wide)
// =====================================================

export async function fetchAllTickets(
  filters?: { status?: string; priority?: string; category?: string; search?: string }
): Promise<{ data: TicketData[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.search) params.append('search', filters.search);
  const qs = params.toString();
  const data = await apiGet<{ success: boolean; data: TicketData[]; total: number }>(
    TICKETS_PREFIX, `/admin/all${qs ? `?${qs}` : ''}`
  );
  return { data: data?.data || [], total: data?.total || 0 };
}

// =====================================================
// ADMIN - TICKET STATS (platform-wide)
// =====================================================

export interface AdminTicketStats {
  total: number;
  open: number;
  in_progress: number;
  waiting_response: number;
  resolved: number;
  closed: number;
  by_priority: Record<string, number>;
  by_category: Record<string, number>;
  overdue: number;
  avg_resolution_time: number;
  avg_rating: number;
}

export async function fetchAdminTicketStats(): Promise<AdminTicketStats | null> {
  const data = await apiGet<{ success: boolean; data: AdminTicketStats }>(TICKETS_PREFIX, '/admin/stats');
  return data?.data || null;
}

// =====================================================
// ADMIN - TICKET MESSAGES & ACTIONS
// =====================================================

export interface TicketMessageData {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  attachments: any[];
  internal_note: boolean;
  created_at: string;
}

export async function fetchTicketMessages(ticketId: string): Promise<TicketMessageData[]> {
  const data = await apiGet<{ success: boolean; data: TicketMessageData[] }>(
    TICKETS_PREFIX, `/${ticketId}/messages`
  );
  return data?.data || [];
}

export async function sendTicketMessage(ticketId: string, params: {
  sender_id: string;
  sender_type: 'user' | 'support' | 'admin';
  message: string;
  internal_note?: boolean;
}): Promise<TicketMessageData | null> {
  const data = await apiMutate<{ success: boolean; data: TicketMessageData }>(
    TICKETS_PREFIX, `/${ticketId}/messages`, 'POST', params
  );
  return data?.data || null;
}

export async function updateTicket(ticketId: string, params: Record<string, any>): Promise<TicketData | null> {
  const data = await apiMutate<{ success: boolean; data: TicketData }>(
    TICKETS_PREFIX, `/${ticketId}`, 'PUT', params
  );
  return data?.data || null;
}

export async function createTicket(params: {
  user_id: string;
  subject: string;
  description: string;
  category: string;
  priority?: string;
}): Promise<TicketData | null> {
  const data = await apiMutate<{ success: boolean; data: TicketData }>(
    TICKETS_PREFIX, '/create', 'POST', params
  );
  return data?.data || null;
}

// =====================================================
// ADMIN - ACCOUNTING
// =====================================================

const ACCT = PAYMENTS_PREFIX;

// ── Tax Reports ──

export interface AccountingReport {
  id: number;
  type: string;
  period: string;
  taxPeriod: string;
  status: string;
  amount: number;
  taxAmount: number;
  deadline: string;
  createdAt: string;
  sentAt?: string;
  acceptedAt?: string;
  fileName?: string;
  inn?: string;
  kpp?: string;
  oktmo?: string;
}

export async function fetchAccountingReports(
  filters?: { status?: string; type?: string; taxPeriod?: string }
): Promise<AccountingReport[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.taxPeriod) params.append('taxPeriod', filters.taxPeriod);
  const qs = params.toString();
  const data = await apiGet<{ success: boolean; data: AccountingReport[] }>(
    ACCT, `/admin/accounting/reports${qs ? `?${qs}` : ''}`
  );
  return data?.data || [];
}

export async function createAccountingReport(report: Partial<AccountingReport>): Promise<AccountingReport | null> {
  const data = await apiMutate<{ success: boolean; data: AccountingReport }>(
    ACCT, '/admin/accounting/reports', 'POST', report
  );
  return data?.data || null;
}

export async function updateAccountingReport(id: number, params: Record<string, any>): Promise<AccountingReport | null> {
  const data = await apiMutate<{ success: boolean; data: AccountingReport }>(
    ACCT, `/admin/accounting/reports/${id}`, 'PUT', params
  );
  return data?.data || null;
}

export async function deleteAccountingReport(id: number): Promise<boolean> {
  const data = await apiMutate<{ success: boolean }>(
    ACCT, `/admin/accounting/reports/${id}`, 'DELETE'
  );
  return data?.success || false;
}

// ── Primary Documents ──

export interface AccountingDocument {
  id: number;
  type: string;
  number: string;
  date: string;
  counterparty: string;
  counterpartyINN: string;
  amount: number;
  vatAmount: number;
  vatRate: number;
  status: string;
  description: string;
  paymentDeadline?: string;
  paidAt?: string;
  attachments?: string[];
}

export async function fetchAccountingDocuments(search?: string): Promise<AccountingDocument[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  const data = await apiGet<{ success: boolean; data: AccountingDocument[] }>(
    ACCT, `/admin/accounting/documents${qs}`
  );
  return data?.data || [];
}

export async function createAccountingDocument(doc: Partial<AccountingDocument>): Promise<AccountingDocument | null> {
  const data = await apiMutate<{ success: boolean; data: AccountingDocument }>(
    ACCT, '/admin/accounting/documents', 'POST', doc
  );
  return data?.data || null;
}

export async function updateAccountingDocument(id: number, params: Record<string, any>): Promise<AccountingDocument | null> {
  const data = await apiMutate<{ success: boolean; data: AccountingDocument }>(
    ACCT, `/admin/accounting/documents/${id}`, 'PUT', params
  );
  return data?.data || null;
}

// ── Ledger ──

export interface AccountingLedgerEntry {
  id: number;
  date: string;
  documentNumber: string;
  counterparty: string;
  operation: string;
  debit: string;
  credit: string;
  amount: number;
  description: string;
}

export async function fetchAccountingLedger(): Promise<AccountingLedgerEntry[]> {
  const data = await apiGet<{ success: boolean; data: AccountingLedgerEntry[] }>(
    ACCT, '/admin/accounting/ledger'
  );
  return data?.data || [];
}

export async function createAccountingLedgerEntry(entry: Partial<AccountingLedgerEntry>): Promise<AccountingLedgerEntry | null> {
  const data = await apiMutate<{ success: boolean; data: AccountingLedgerEntry }>(
    ACCT, '/admin/accounting/ledger', 'POST', entry
  );
  return data?.data || null;
}

// ── Counterparties ──

export interface AccountingCounterparty {
  id: number;
  name: string;
  inn: string;
  kpp?: string;
  ogrn?: string;
  address: string;
  phone?: string;
  email?: string;
  director: string;
  accountant?: string;
  bankName: string;
  bik: string;
  accountNumber: string;
  corrAccountNumber: string;
  type: string;
  totalReceived: number;
  totalPaid: number;
  balance: number;
  contractsCount: number;
  lastActivityDate: string;
  status: string;
}

export async function fetchAccountingCounterparties(search?: string): Promise<AccountingCounterparty[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  const data = await apiGet<{ success: boolean; data: AccountingCounterparty[] }>(
    ACCT, `/admin/accounting/counterparties${qs}`
  );
  return data?.data || [];
}

export async function createAccountingCounterparty(cp: Partial<AccountingCounterparty>): Promise<AccountingCounterparty | null> {
  const data = await apiMutate<{ success: boolean; data: AccountingCounterparty }>(
    ACCT, '/admin/accounting/counterparties', 'POST', cp
  );
  return data?.data || null;
}

export async function updateAccountingCounterparty(id: number, params: Record<string, any>): Promise<AccountingCounterparty | null> {
  const data = await apiMutate<{ success: boolean; data: AccountingCounterparty }>(
    ACCT, `/admin/accounting/counterparties/${id}`, 'PUT', params
  );
  return data?.data || null;
}

// ── Tax Calendar ──

export interface AccountingCalendarEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  type: string;
  completed: boolean;
  amount?: number;
}

export async function fetchAccountingCalendar(): Promise<AccountingCalendarEvent[]> {
  const data = await apiGet<{ success: boolean; data: AccountingCalendarEvent[] }>(
    ACCT, '/admin/accounting/calendar'
  );
  return data?.data || [];
}

export async function createAccountingCalendarEvent(event: Partial<AccountingCalendarEvent>): Promise<AccountingCalendarEvent | null> {
  const data = await apiMutate<{ success: boolean; data: AccountingCalendarEvent }>(
    ACCT, '/admin/accounting/calendar', 'POST', event
  );
  return data?.data || null;
}

export async function updateAccountingCalendarEvent(id: number, params: Record<string, any>): Promise<AccountingCalendarEvent | null> {
  const data = await apiMutate<{ success: boolean; data: AccountingCalendarEvent }>(
    ACCT, `/admin/accounting/calendar/${id}`, 'PUT', params
  );
  return data?.data || null;
}

// ── Accounting Summary ──

export interface AccountingSummary {
  totalTaxPaid: number;
  pendingTax: number;
  totalDocsPaid: number;
  totalVAT: number;
  pendingPayments: number;
  upcomingDeadlines: AccountingCalendarEvent[];
  reportsCount: number;
  documentsCount: number;
  calendarEventsCount: number;
}

export async function fetchAccountingSummary(): Promise<AccountingSummary | null> {
  const data = await apiGet<{ success: boolean; data: AccountingSummary }>(
    ACCT, '/admin/accounting/summary'
  );
  return data?.data || null;
}