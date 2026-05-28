import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  tier: 1 | 2;
  kycStatus: 'none' | 'pending' | 'verified';
  walletNgn: number;
  walletUsd: number;
  biometricEnabled: boolean;
  pushNotifications: boolean;
  emailDigests: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  issuer: string;
  cat: string;
  label: string;
  apy: number;
  risk: 1 | 2 | 3;
  minimum: number;
  lock: string;
  currency: 'NGN' | 'USD';
  blurb: string;
  tags: string[];
}

export interface Holding {
  id: string;
  userId: string;
  productId: string;
  invested: number;
  current: number;
  units: number;
  since: string;
  currency: 'NGN' | 'USD';
}

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  type: 'deposit' | 'buy' | 'sell' | 'earn' | 'withdraw';
  title: string;
  meta: string;
  amount: number;
  usd?: number;
}

export interface Notification {
  id: string;
  userId: string;
  when: string;
  cat: 'earn' | 'market' | 'secure' | 'goal' | 'system';
  title: string;
  body: string;
  unread: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  target: number;
  current: number;
  currency: 'NGN' | 'USD';
  cat: string;
}

export interface LinkedAccount {
  id: string;
  userId: string;
  type: 'bank' | 'card';
  name: string;
  last4: string;
  isDefault: boolean;
  meta?: string;
}

@Injectable()
export class InMemoryStore {
  private users: User[] = [];
  private products: Product[] = [];
  private holdings: Holding[] = [];
  private transactions: Transaction[] = [];
  private notifications: Notification[] = [];
  private goals: Goal[] = [];
  private linkedAccounts: LinkedAccount[] = [];

  constructor() {
    this.seed();
  }

  private async seed() {
    const hash = await bcrypt.hash('password123', 10);

    const user: User = {
      id: 'u1',
      name: 'Amaka Obi',
      email: 'amaka.obi@frevest.co',
      passwordHash: hash,
      phone: '+2348030000000',
      tier: 1,
      kycStatus: 'verified',
      walletNgn: 142300,
      walletUsd: 312.40,
      biometricEnabled: true,
      pushNotifications: true,
      emailDigests: false,
      createdAt: '2025-01-15',
    };
    this.users.push(user);

    this.products = [
      { id: 'p1', name: 'Money Market Plus', issuer: 'Stanbic IBTC', cat: 'mutual', label: 'Mutual Fund',
        apy: 18.4, risk: 1, minimum: 5000, lock: '90 days', currency: 'NGN',
        blurb: 'A naira fund that invests in commercial papers and short-term placements. Pays daily, withdraw anytime after lock.',
        tags: ['Naira', 'Short-term'] },
      { id: 'p2', name: 'FGN Treasury Bills', issuer: 'Federal Govt. Nigeria', cat: 'treasury', label: 'T-Bills',
        apy: 22.7, risk: 1, minimum: 50000, lock: '182 days', currency: 'NGN',
        blurb: 'Government-backed debt securities. Considered the safest naira-denominated investment in Nigeria.',
        tags: ['Naira', 'Govt-backed'] },
      { id: 'p3', name: 'Fixed Lock 365', issuer: 'Frevest Vault', cat: 'fixed', label: 'Fixed Savings',
        apy: 20.5, risk: 1, minimum: 10000, lock: '365 days', currency: 'NGN',
        blurb: 'Lock funds for 12 months at a guaranteed rate. Early break forfeits accrued interest.',
        tags: ['Locked', 'Guaranteed'] },
      { id: 'p4', name: 'USD Liquid Yield', issuer: 'Frevest Global', cat: 'dollar', label: 'Dollar Fund',
        apy: 8.2, risk: 2, minimum: 100, lock: '30 days', currency: 'USD',
        blurb: 'Dollar-denominated fund holding US money-market instruments and short Treasuries. Hedges naira inflation.',
        tags: ['Dollar', 'Liquid'] },
      { id: 'p5', name: 'Lagos Real Estate Trust', issuer: 'Pinnacle REIT', cat: 'realestate', label: 'Real Estate',
        apy: 14.2, risk: 2, minimum: 25000, lock: '180 days', currency: 'NGN',
        blurb: 'Diversified across Lagos and Abuja commercial properties. Rental income distributed quarterly.',
        tags: ['Real Assets', 'Quarterly'] },
      { id: 'p6', name: 'Global Equity Index', issuer: 'Vanguard via Frevest', cat: 'stocks', label: 'Stocks/ETF',
        apy: 11.6, risk: 3, minimum: 50, lock: 'No lock', currency: 'USD',
        blurb: 'Tracks the FTSE Global All-Cap. Long-term equity exposure for compounded growth.',
        tags: ['Equity', 'Long-term'] },
      { id: 'p7', name: 'Eurobond Income', issuer: 'Sovereign Eurobonds', cat: 'bonds', label: 'Bonds',
        apy: 9.4, risk: 2, minimum: 200, lock: '270 days', currency: 'USD',
        blurb: 'Dollar bonds from emerging-market sovereigns. Higher yield than US Treasuries with moderate risk.',
        tags: ['Dollar', 'Income'] },
    ];

    this.holdings = [
      { id: 'h1', userId: 'u1', productId: 'p1', invested: 850000, current: 932400, units: 8412.3, since: 'Mar 2025', currency: 'NGN' },
      { id: 'h2', userId: 'u1', productId: 'p2', invested: 600000, current: 651200, units: 600, since: 'Aug 2025', currency: 'NGN' },
      { id: 'h3', userId: 'u1', productId: 'p4', invested: 1200, current: 1342, units: 134.2, since: 'Jan 2025', currency: 'USD' },
      { id: 'h4', userId: 'u1', productId: 'p5', invested: 400000, current: 442000, units: 16, since: 'Jun 2025', currency: 'NGN' },
      { id: 'h5', userId: 'u1', productId: 'p6', invested: 800, current: 893, units: 9.4, since: 'Feb 2025', currency: 'USD' },
    ];

    this.transactions = [
      { id: 't1', userId: 'u1', date: '2026-05-26', type: 'deposit', title: 'Wallet funded', meta: 'Access Bank ••4421', amount: 250000 },
      { id: 't2', userId: 'u1', date: '2026-05-26', type: 'buy', title: 'Money Market Plus', meta: 'Subscribe', amount: -150000 },
      { id: 't3', userId: 'u1', date: '2026-05-24', type: 'earn', title: 'Treasury Bills payout', meta: 'Coupon · monthly', amount: 11420 },
      { id: 't4', userId: 'u1', date: '2026-05-21', type: 'buy', title: 'USD Liquid Yield', meta: 'Subscribe', amount: -160000, usd: 100 },
      { id: 't5', userId: 'u1', date: '2026-05-18', type: 'sell', title: 'Fixed Lock 365', meta: 'Matured', amount: 522400 },
      { id: 't6', userId: 'u1', date: '2026-05-14', type: 'earn', title: 'Real Estate Trust', meta: 'Quarterly rent', amount: 8800 },
      { id: 't7', userId: 'u1', date: '2026-05-10', type: 'withdraw', title: 'Withdraw to bank', meta: 'GTBank ••0192', amount: -100000 },
      { id: 't8', userId: 'u1', date: '2026-05-08', type: 'buy', title: 'Global Equity Index', meta: 'Subscribe', amount: -82000, usd: 50 },
      { id: 't9', userId: 'u1', date: '2026-05-03', type: 'deposit', title: 'Wallet funded', meta: 'Card ••2207', amount: 500000 },
      { id: 't10', userId: 'u1', date: '2026-04-29', type: 'earn', title: 'Money Market Plus', meta: 'Daily distribution', amount: 1840 },
    ];

    this.notifications = [
      { id: 'n1', userId: 'u1', when: 'just now', cat: 'earn', title: 'You earned ₦1,840 today', body: 'Daily distribution from Money Market Plus.', unread: true, createdAt: new Date().toISOString() },
      { id: 'n2', userId: 'u1', when: '2h ago', cat: 'market', title: 'Treasury Bills auction tomorrow', body: '182-day yields trending up to ~22.9%. Lock in early.', unread: true, createdAt: new Date().toISOString() },
      { id: 'n3', userId: 'u1', when: 'Today', cat: 'secure', title: 'New sign-in from iPhone 16 Pro', body: 'Lagos, NG · If this was not you, lock your account.', unread: true, createdAt: new Date().toISOString() },
      { id: 'n4', userId: 'u1', when: 'Yesterday', cat: 'goal', title: 'Halfway to "Dollar Buffer"', body: "You're 52% of the way. Stay consistent — auto-invest is on.", unread: false, createdAt: new Date().toISOString() },
      { id: 'n5', userId: 'u1', when: '2 days', cat: 'system', title: 'KYC level upgraded to Tier 2', body: 'Daily transaction limit is now ₦5,000,000.', unread: false, createdAt: new Date().toISOString() },
      { id: 'n6', userId: 'u1', when: '4 days', cat: 'market', title: 'Real Estate quarterly payout', body: '₦8,800 credited from Lagos Real Estate Trust.', unread: false, createdAt: new Date().toISOString() },
    ];

    this.goals = [
      { id: 'g1', userId: 'u1', name: 'Dollar buffer', target: 5000, current: 2580, currency: 'USD', cat: 'dollar' },
      { id: 'g2', userId: 'u1', name: 'House down-payment', target: 8000000, current: 2300000, currency: 'NGN', cat: 'realestate' },
      { id: 'g3', userId: 'u1', name: '2027 emergency fund', target: 2000000, current: 1670000, currency: 'NGN', cat: 'fixed' },
    ];

    this.linkedAccounts = [
      { id: 'la1', userId: 'u1', type: 'bank', name: 'GTBank · Amaka O. Obi', last4: '4421', isDefault: true, meta: '0192 ••• 4421' },
      { id: 'la2', userId: 'u1', type: 'card', name: 'Visa Platinum', last4: '2207', isDefault: false, meta: 'Exp 09/27' },
    ];
  }

  // Users
  findUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }
  findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }
  createUser(data: Omit<User, 'id'>): User {
    const user: User = { ...data, id: `u${Date.now()}` };
    this.users.push(user);
    return user;
  }
  updateUser(id: string, patch: Partial<User>): User | undefined {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.users[idx] = { ...this.users[idx], ...patch };
    return this.users[idx];
  }

  // Products
  getProducts(): Product[] {
    return this.products;
  }
  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  // Holdings
  getHoldingsByUser(userId: string): Holding[] {
    return this.holdings.filter(h => h.userId === userId);
  }
  getHoldingByUserAndProduct(userId: string, productId: string): Holding | undefined {
    return this.holdings.find(h => h.userId === userId && h.productId === productId);
  }
  createHolding(data: Omit<Holding, 'id'>): Holding {
    const holding: Holding = { ...data, id: `h${Date.now()}` };
    this.holdings.push(holding);
    return holding;
  }
  updateHolding(id: string, patch: Partial<Holding>): Holding | undefined {
    const idx = this.holdings.findIndex(h => h.id === id);
    if (idx === -1) return undefined;
    this.holdings[idx] = { ...this.holdings[idx], ...patch };
    return this.holdings[idx];
  }

  // Transactions
  getTransactionsByUser(userId: string): Transaction[] {
    return this.transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  createTransaction(data: Omit<Transaction, 'id'>): Transaction {
    const tx: Transaction = { ...data, id: `t${Date.now()}` };
    this.transactions.unshift(tx);
    return tx;
  }

  // Notifications
  getNotificationsByUser(userId: string): Notification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  markNotificationRead(id: string, userId: string): Notification | undefined {
    const n = this.notifications.find(n => n.id === id && n.userId === userId);
    if (n) n.unread = false;
    return n;
  }
  markAllNotificationsRead(userId: string): void {
    this.notifications.filter(n => n.userId === userId).forEach(n => (n.unread = false));
  }

  // Goals
  getGoalsByUser(userId: string): Goal[] {
    return this.goals.filter(g => g.userId === userId);
  }
  getGoalById(id: string, userId: string): Goal | undefined {
    return this.goals.find(g => g.id === id && g.userId === userId);
  }
  createGoal(data: Omit<Goal, 'id'>): Goal {
    const goal: Goal = { ...data, id: `g${Date.now()}` };
    this.goals.push(goal);
    return goal;
  }
  updateGoal(id: string, userId: string, patch: Partial<Goal>): Goal | undefined {
    const idx = this.goals.findIndex(g => g.id === id && g.userId === userId);
    if (idx === -1) return undefined;
    this.goals[idx] = { ...this.goals[idx], ...patch };
    return this.goals[idx];
  }
  deleteGoal(id: string, userId: string): boolean {
    const idx = this.goals.findIndex(g => g.id === id && g.userId === userId);
    if (idx === -1) return false;
    this.goals.splice(idx, 1);
    return true;
  }

  // Linked accounts
  getLinkedAccountsByUser(userId: string): LinkedAccount[] {
    return this.linkedAccounts.filter(a => a.userId === userId);
  }
  createLinkedAccount(data: Omit<LinkedAccount, 'id'>): LinkedAccount {
    const account: LinkedAccount = { ...data, id: `la${Date.now()}` };
    this.linkedAccounts.push(account);
    return account;
  }
  deleteLinkedAccount(id: string, userId: string): boolean {
    const idx = this.linkedAccounts.findIndex(a => a.id === id && a.userId === userId);
    if (idx === -1) return false;
    this.linkedAccounts.splice(idx, 1);
    return true;
  }
}
