import { User, Session, Role, AuditEntry } from '../../types';

// WebCrypto PBKDF2 implementation
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 10000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await crypto.subtle.exportKey('raw', derivedKey);
  return Array.from(new Uint8Array(exported))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const STORAGE_USERS_KEY = 'voltghost_users_v1';
const STORAGE_SESSION_KEY = 'voltghost_session_v1';
const STORAGE_FAILED_KEY = 'voltghost_failed_attempts';
const STORAGE_LOCKOUT_KEY = 'voltghost_lockout_until';

// Initial seeded accounts
const SEED_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Sarah Chen (Master Admin)',
    email: 'admin@voltghost.io',
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // will initialize
    salt: 'voltghost_salt_admin',
    role: 'admin',
    twoFAEnabled: true,
    twoFASecret: 'VOLT-GHOST-2FA-SEED',
    lastLogin: new Date().toISOString(),
    status: 'active',
    themeId: 'ghost-neon',
    device: 'MacBook Pro / Chrome 128',
  },
  {
    id: 'usr_operator',
    name: 'Marcus Vance (Lead Operator)',
    email: 'operator@voltghost.io',
    passwordHash: '',
    salt: 'voltghost_salt_op',
    role: 'operator',
    twoFAEnabled: false,
    lastLogin: new Date().toISOString(),
    status: 'active',
    themeId: 'ghost-neon',
    device: 'Windows Workstation / Edge',
  },
  {
    id: 'usr_viewer',
    name: 'Elena Rostova (Sustainability Auditor)',
    email: 'viewer@voltghost.io',
    passwordHash: '',
    salt: 'voltghost_salt_view',
    role: 'viewer',
    twoFAEnabled: false,
    lastLogin: new Date().toISOString(),
    status: 'active',
    themeId: 'ghost-neon',
    device: 'iPad Pro / Safari',
  },
];

export class AuthService {
  private users: User[] = [];
  private currentSession: Session | null = null;
  private currentUser: User | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    // Load or initialize users
    const stored = localStorage.getItem(STORAGE_USERS_KEY);
    if (stored) {
      try {
        this.users = JSON.parse(stored);
      } catch {
        this.users = [];
      }
    }

    if (this.users.length === 0) {
      // Initialize hashes for seed accounts
      const adminHash = await hashPassword('Admin@123', SEED_USERS[0].salt);
      const opHash = await hashPassword('Operator@123', SEED_USERS[1].salt);
      const viewHash = await hashPassword('Viewer@123', SEED_USERS[2].salt);

      SEED_USERS[0].passwordHash = adminHash;
      SEED_USERS[1].passwordHash = opHash;
      SEED_USERS[2].passwordHash = viewHash;

      this.users = [...SEED_USERS];
      this.saveUsers();
    }

    // Restore session if active
    const sessionStr = localStorage.getItem(STORAGE_SESSION_KEY);
    if (sessionStr) {
      try {
        const session: Session = JSON.parse(sessionStr);
        if (new Date(session.expiresAt) > new Date()) {
          const user = this.users.find((u) => u.id === session.userId);
          if (user && user.status === 'active') {
            this.currentSession = session;
            this.currentUser = user;
          } else {
            this.logout();
          }
        } else {
          this.logout();
        }
      } catch {
        this.logout();
      }
    }

    this.isInitialized = true;
  }

  private saveUsers() {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(this.users));
  }

  getUsers(): User[] {
    return [...this.users];
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  getLockoutRemainingSec(): number {
    const lockoutUntil = parseInt(localStorage.getItem(STORAGE_LOCKOUT_KEY) || '0', 10);
    const now = Date.now();
    if (lockoutUntil > now) {
      return Math.ceil((lockoutUntil - now) / 1000);
    }
    return 0;
  }

  async login(
    email: string,
    passwordPlain: string
  ): Promise<{ success: boolean; requires2FA?: boolean; user?: User; error?: string }> {
    await this.init();

    // Check rate limiting lockout
    const remainingSec = this.getLockoutRemainingSec();
    if (remainingSec > 0) {
      return { success: false, error: `Account locked due to multiple failed attempts. Try again in ${remainingSec}s.` };
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = this.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      this.registerFailedAttempt();
      return { success: false, error: 'Invalid email or password.' };
    }

    if (user.status === 'suspended') {
      return { success: false, error: 'Account suspended. Contact Master Admin.' };
    }

    const computedHash = await hashPassword(passwordPlain, user.salt);
    if (computedHash !== user.passwordHash) {
      this.registerFailedAttempt();
      return { success: false, error: 'Invalid email or password.' };
    }

    // Reset failed attempts on success
    localStorage.removeItem(STORAGE_FAILED_KEY);
    localStorage.removeItem(STORAGE_LOCKOUT_KEY);

    // If 2FA enabled
    if (user.twoFAEnabled) {
      return { success: true, requires2FA: true, user };
    }

    return this.completeLogin(user);
  }

  verify2FA(user: User, code: string): { success: boolean; error?: string } {
    // In demo mode, accepts "123456" or any valid 6-digit TOTP format
    if (code.trim() === '123456' || code.trim().length === 6) {
      this.completeLogin(user);
      return { success: true };
    }
    return { success: false, error: 'Invalid 2FA code. Demo code is 123456.' };
  }

  private completeLogin(user: User): { success: boolean; user: User } {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const session: Session = {
      id: 'sess_' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt,
      device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser',
      isCurrent: true,
    };

    user.lastLogin = new Date().toISOString();
    this.saveUsers();

    this.currentSession = session;
    this.currentUser = user;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));

    return { success: true, user };
  }

  private registerFailedAttempt() {
    const attempts = parseInt(localStorage.getItem(STORAGE_FAILED_KEY) || '0', 10) + 1;
    localStorage.setItem(STORAGE_FAILED_KEY, attempts.toString());

    if (attempts >= 5) {
      const lockUntil = Date.now() + 30 * 1000; // 30s lockout
      localStorage.setItem(STORAGE_LOCKOUT_KEY, lockUntil.toString());
      localStorage.removeItem(STORAGE_FAILED_KEY);
    }
  }

  logout(): void {
    this.currentSession = null;
    this.currentUser = null;
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }

  async createUser(
    name: string,
    email: string,
    role: Role,
    passwordPlain: string = 'Demo@123'
  ): Promise<User> {
    const salt = generateSalt();
    const hash = await hashPassword(passwordPlain, salt);
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email: email.trim().toLowerCase(),
      passwordHash: hash,
      salt,
      role,
      twoFAEnabled: role === 'admin',
      lastLogin: 'Never',
      status: 'active',
      themeId: 'ghost-neon',
      device: 'New Invite',
    };
    this.users.push(newUser);
    this.saveUsers();
    return newUser;
  }

  updateUserRole(userId: string, newRole: Role): void {
    const u = this.users.find((user) => user.id === userId);
    if (u) {
      u.role = newRole;
      this.saveUsers();
      if (this.currentUser?.id === userId) {
        this.currentUser.role = newRole;
      }
    }
  }

  toggleUserStatus(userId: string): void {
    const u = this.users.find((user) => user.id === userId);
    if (u) {
      u.status = u.status === 'active' ? 'suspended' : 'active';
      this.saveUsers();
    }
  }

  deleteUser(userId: string): void {
    this.users = this.users.filter((u) => u.id !== userId);
    this.saveUsers();
  }

  async resetUserPassword(userId: string, newPass: string): Promise<void> {
    const u = this.users.find((user) => user.id === userId);
    if (u) {
      u.passwordHash = await hashPassword(newPass, u.salt);
      this.saveUsers();
    }
  }
}

export const authService = new AuthService();
