import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ghost,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { authService } from '../lib/auth/authService';
import { sound } from '../lib/sound/soundEffects';

interface LandingHeroPageProps {
  onLoginSuccess: () => void;
}

export const LandingHeroPage: React.FC<LandingHeroPageProps> = ({ onLoginSuccess }) => {
  const { login, totalWastedKwh, totalCostInr, totalCo2Kg } = useAppStore();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | '2fa'>('login');
  const [email, setEmail] = useState('admin@voltghost.io');
  const [password, setPassword] = useState('Admin@123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [twoFACode, setTwoFACode] = useState('');
  const [pendingUser, setPendingUser] = useState<any>(null);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lockoutSec, setLockoutSec] = useState(0);
  const [demoCredsOpen, setDemoCredsOpen] = useState(true);

  // Live Password Strength Meter
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (pass.toLowerCase() !== 'password' && pass.toLowerCase() !== 'admin123') score++;
    return score; // 0 to 5
  };

  const passwordStrength = getPasswordStrength(password);

  // Check rate limit lockout countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = authService.getLockoutRemainingSec();
      setLockoutSec(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (lockoutSec > 0) {
      setError(`Form locked due to failed attempts. Please wait ${lockoutSec}s.`);
      return;
    }

    const res = await authService.login(email, password);
    if (!res.success) {
      sound.playAlert('high');
      setError(res.error || 'Login failed.');
      return;
    }

    if (res.requires2FA && res.user) {
      setPendingUser(res.user);
      setMode('2fa');
      sound.playClick(600);
      return;
    }

    if (res.user) {
      const session = authService.getCurrentSession()!;
      login(res.user, session);
      sound.playGhostBusted();
      onLoginSuccess();
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;

    const res = authService.verify2FA(pendingUser, twoFACode);
    if (!res.success) {
      sound.playAlert('high');
      setError(res.error || 'Invalid 2FA code.');
      return;
    }

    const session = authService.getCurrentSession()!;
    login(pendingUser, session);
    sound.playGhostBusted();
    onLoginSuccess();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (passwordStrength < 3) {
      setError('Password is too weak. Please use uppercase, numbers, and symbols.');
      return;
    }

    const newUser = await authService.createUser(name || 'New Member', email, 'operator', password);
    setSuccessMessage('Account created successfully! Please sign in with your credentials.');
    setMode('login');
    sound.playClick();
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(`Password reset link simulated and sent to ${email}. (Use Demo Credentials to sign in immediately)`);
    setMode('login');
    sound.playClick();
  };

  const selectDemoAccount = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError('');
    sound.playClick();
  };

  return (
    <div className="min-h-screen w-full bg-[#070B14] text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Neon Factory Ambient Lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#00FFC6]/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[650px] h-[650px] rounded-full bg-[#8B5CF6]/15 blur-[160px] pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-20 px-6 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00FFC6] to-[#8B5CF6] p-0.5 shadow-lg shadow-[#00FFC6]/20">
            <div className="w-full h-full bg-[#070B14] rounded-[14px] flex items-center justify-center">
              <Ghost className="w-6 h-6 text-[#00FFC6] animate-ghost-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white m-0">VoltGhost</h1>
            <div className="text-[10px] text-[#00FFC6] font-mono tracking-widest uppercase font-bold">
              Hunt your energy ghosts
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => selectDemoAccount('admin@voltghost.io', 'Admin@123')}
            className="px-4 py-2 rounded-xl bg-[#00FFC6]/15 hover:bg-[#00FFC6]/25 border border-[#00FFC6]/40 text-[#00FFC6] text-xs font-bold transition flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Instant Demo (Admin)</span>
          </button>
        </div>
      </header>

      {/* Split Hero Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-20">
        {/* Left Column: Visionary Concept & Live Stats */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00FFC6]">
            <span className="w-2 h-2 rounded-full bg-[#00FFC6] animate-ping" />
            <span>DIGITAL TWIN + COMPUTER VISION SENSOR FUSION</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] m-0">
            Every machine has an <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFC6] to-[#8B5CF6]">ideal ghost</span>.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
            Real consumption minus Ghost consumption equals your <strong className="text-[#FF3366]">Ghost Gap</strong>: avoidable industrial energy waste. VoltGhost fuses live Computer Vision and sensor streams to eliminate waste before it hits your bill.
          </p>

          {/* Animated Counters Banner */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="p-3">
              <div className="text-xs text-slate-400 font-medium">Live Waste Tracked</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#FF3366] font-mono mt-1">
                {totalWastedKwh.toFixed(1)} <span className="text-xs font-normal text-slate-400">kWh</span>
              </div>
            </div>
            <div className="p-3 border-x border-white/10">
              <div className="text-xs text-slate-400 font-medium">Financial Exposure</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-1">
                ₹{Math.round(totalCostInr).toLocaleString()}
              </div>
            </div>
            <div className="p-3">
              <div className="text-xs text-slate-400 font-medium">Scope 2 CO₂e</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#00FFC6] font-mono mt-1">
                {totalCo2Kg.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
            </div>
          </div>

          {/* Demo Credentials Expandable Card */}
          <div className="rounded-2xl bg-[#0F172A]/80 border border-white/10 overflow-hidden">
            <button
              onClick={() => setDemoCredsOpen(!demoCredsOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition bg-white/5"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00FFC6]" />
                <span>Pre-configured Demo Accounts (Click to Fill)</span>
              </div>
              {demoCredsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {demoCredsOpen && (
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => selectDemoAccount('admin@voltghost.io', 'Admin@123')}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left hover:border-amber-400 transition"
                >
                  <div className="font-bold text-amber-300">Master Admin</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">admin@voltghost.io</div>
                  <div className="text-[10px] text-amber-400/80 font-mono mt-1">Pass: Admin@123</div>
                </button>

                <button
                  type="button"
                  onClick={() => selectDemoAccount('operator@voltghost.io', 'Operator@123')}
                  className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-left hover:border-cyan-400 transition"
                >
                  <div className="font-bold text-cyan-300">Operator</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">operator@voltghost.io</div>
                  <div className="text-[10px] text-cyan-400/80 font-mono mt-1">Pass: Operator@123</div>
                </button>

                <button
                  type="button"
                  onClick={() => selectDemoAccount('viewer@voltghost.io', 'Viewer@123')}
                  className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/30 text-left hover:border-slate-400 transition"
                >
                  <div className="font-bold text-slate-300">Viewer</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">viewer@voltghost.io</div>
                  <div className="text-[10px] text-slate-400/80 font-mono mt-1">Pass: Viewer@123</div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Glass Auth Card */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl relative">
            {/* Top Mode Tabs */}
            {mode !== '2fa' && (
              <div className="flex border-b border-white/10 pb-4 mb-6 gap-6 text-sm font-bold">
                <button
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className={`transition pb-1 ${
                    mode === 'login'
                      ? 'text-[#00FFC6] border-b-2 border-[#00FFC6]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className={`transition pb-1 ${
                    mode === 'signup'
                      ? 'text-[#00FFC6] border-b-2 border-[#00FFC6]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error or Success Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {lockoutSec > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Security lockout active. Try again in {lockoutSec}s.</span>
              </div>
            )}

            {/* MODE: LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00FFC6] transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-[#00FFC6] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00FFC6] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-[#00FFC6] focus:ring-0"
                    />
                    <span>Remember this workstation</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={lockoutSec > 0}
                  className="w-full py-3 bg-[#00FFC6] hover:bg-[#33ffdc] text-black font-extrabold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-[#00FFC6]/20 disabled:opacity-50"
                >
                  <span>Enter Facility Control</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* MODE: SIGN UP */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marcus Vance"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00FFC6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@company.com"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00FFC6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Choose Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00FFC6]"
                  />
                  {/* Live Password Strength Meter */}
                  <div className="mt-2">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <span
                          key={lvl}
                          className={`flex-1 rounded-full transition-all ${
                            passwordStrength >= lvl
                              ? lvl <= 2
                                ? 'bg-red-500'
                                : lvl <= 3
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>Strength</span>
                      <span className="font-semibold text-slate-300">
                        {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00FFC6]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#00FFC6] hover:bg-[#33ffdc] text-black font-extrabold rounded-xl text-sm transition"
                >
                  Create Facility Account
                </button>
              </form>
            )}

            {/* MODE: FORGOT PASSWORD */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-sm text-slate-300">
                  Enter your registered email to receive a password reset recovery token.
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00FFC6]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#00FFC6] text-black font-extrabold rounded-xl text-sm"
                  >
                    Send Reset Token
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="px-4 py-3 bg-white/10 text-white rounded-xl text-sm"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}

            {/* MODE: 2FA VERIFICATION */}
            {mode === '2fa' && (
              <form onSubmit={handleVerify2FA} className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-400">
                  Enter the 6-digit TOTP authenticator code generated for Master Admin.{' '}
                  <span className="text-[#00FFC6] font-mono font-bold block mt-1">
                    Demo Code: 123456
                  </span>
                </p>

                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00FFC6]"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#00FFC6] hover:bg-[#33ffdc] text-black font-extrabold rounded-xl text-sm transition"
                  >
                    Verify & Authenticate
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="px-4 py-3 bg-white/10 text-white rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <footer className="relative z-20 px-6 py-4 border-t border-white/5 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>VoltGhost Industrial Energy Intelligence • Hackathon Demo Edition</div>
        <div className="font-mono text-[11px] text-slate-400">
          Client-Side WebCrypto PBKDF2 (SHA-256, 10,000 rounds) • Zero Server Leakage
        </div>
      </footer>
    </div>
  );
};
