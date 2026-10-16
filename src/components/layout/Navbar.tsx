import React, { useState } from 'react';
import {
  Ghost,
  Building2,
  Mic,
  MicOff,
  Bell,
  Search,
  Lock,
  LogOut,
  ChevronDown,
  ShieldCheck,
  User as UserIcon,
  Palette,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getRoleBadgeClass } from '../../lib/auth/rbac';
import { voiceAssistant } from '../../lib/ai/voiceAssistant';
import { sound } from '../../lib/sound/soundEffects';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onNavigate: (page: string) => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onNavigate,
  activePage,
}) => {
  const {
    currentUser,
    activeRole,
    switchRole,
    logout,
    setLocked,
    selectedSite,
    setSelectedSite,
    soundEnabled,
    toggleSound,
    setIslandState,
    ghostEvents,
  } = useAppStore();

  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const unresolvedAlertCount = ghostEvents.filter((g) => !g.resolved).length;

  const handleVoiceToggle = () => {
    if (isListening) {
      voiceAssistant.stopListening();
      setIsListening(false);
      setIslandState({
        type: 'idle',
        title: 'VoltGhost Monitoring',
        message: 'Hunting energy ghosts live',
      });
    } else {
      setIsListening(true);
      sound.playClick(700);
      setIslandState({
        type: 'voice',
        title: 'Voice Assistant Active',
        message: 'Listening for command ("Hey Ghost...")',
      });

      voiceAssistant.startListening(
        (interim) => {
          setIslandState({
            type: 'voice',
            title: 'Listening...',
            message: `"${interim}"`,
          });
        },
        (final) => {
          setIsListening(false);
          setIslandState({
            type: 'ai_streaming',
            title: 'Processing Query',
            message: `"${final}"`,
          });
          sound.playAlert('low');
          // Navigate to coach or answer directly
          onNavigate('coach');
        },
        (err) => {
          setIsListening(false);
          setIslandState({
            type: 'alert',
            title: 'Voice Error',
            message: 'Could not access microphone or recognize speech.',
          });
        }
      );
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-white/10 bg-[#070B14]/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between">
      {/* Left: Logo & Facility Switcher */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00FFC6]/20 to-[#8B5CF6]/20 border border-[#00FFC6]/40 flex items-center justify-center group-hover:scale-105 transition">
            <Ghost className="w-5 h-5 text-[#00FFC6] animate-ghost-pulse" />
          </div>
          <div className="hidden sm:block">
            <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              <span>VoltGhost</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#00FFC6]/20 text-[#00FFC6] border border-[#00FFC6]/40">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider">HUNT YOUR ENERGY GHOSTS</div>
          </div>
        </button>

        {/* Site Switcher */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setSiteDropdownOpen(!siteDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-xs text-white/90 transition"
          >
            <Building2 className="w-3.5 h-3.5 text-[#00FFC6]" />
            <span className="font-medium">{selectedSite}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {siteDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 rounded-xl bg-[#0F172A] border border-white/15 shadow-2xl p-1 z-50">
              {(['Plant Alpha', 'Plant Beta', 'Tech Park Office'] as const).map((site) => (
                <button
                  key={site}
                  onClick={() => {
                    setSelectedSite(site);
                    setSiteDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center justify-between ${
                    selectedSite === site
                      ? 'bg-[#00FFC6]/20 text-[#00FFC6] font-semibold'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span>{site}</span>
                  {selectedSite === site && <span className="w-1.5 h-1.5 rounded-full bg-[#00FFC6]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Spacer for Dynamic Island */}
      <div className="hidden xl:block w-72" />

      {/* Right: Quick actions, Search, Voice, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command Bar Button */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white hover:border-white/25 transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search or command...</span>
          <kbd className="px-1.5 py-0.5 bg-white/10 text-[10px] text-white/60 font-mono rounded">Ctrl+K</kbd>
        </button>

        {/* Voice Assistant Mic */}
        <button
          onClick={handleVoiceToggle}
          className={`p-2 rounded-xl border transition ${
            isListening
              ? 'bg-[#00FFC6]/20 border-[#00FFC6] text-[#00FFC6] animate-pulse'
              : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
          }`}
          title={isListening ? 'Stop Listening' : 'Hey Ghost (Voice Command)'}
        >
          {isListening ? <Mic className="w-4 h-4 text-[#00FFC6]" /> : <MicOff className="w-4 h-4" />}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-xl border transition ${
            soundEnabled
              ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => onNavigate('notifications')}
          className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unresolvedAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
              {unresolvedAlertCount}
            </span>
          )}
        </button>

        {/* Lock Screen Button */}
        <button
          onClick={() => setLocked(true)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-amber-400 hover:border-amber-400/40 transition"
          title="Lock Screen (Ctrl+L)"
        >
          <Lock className="w-4 h-4" />
        </button>

        {/* User Profile Menu & Role Badge */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00FFC6] to-[#8B5CF6] text-black font-extrabold text-xs flex items-center justify-center">
              {currentUser ? currentUser.name[0] : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">
                {currentUser ? currentUser.name.split(' ')[0] : 'Guest'}
              </div>
              <span
                className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${getRoleBadgeClass(
                  activeRole
                )}`}
              >
                {activeRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#0F172A] border border-white/15 shadow-2xl p-2 z-50 text-xs">
              <div className="p-3 border-b border-white/10">
                <div className="font-bold text-white text-sm">{currentUser?.name}</div>
                <div className="text-slate-400 text-[11px] truncate">{currentUser?.email}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getRoleBadgeClass(
                      activeRole
                    )}`}
                  >
                    Role: {activeRole}
                  </span>
                </div>
              </div>

              {/* Role Switcher for Demo Preview */}
              <div className="py-2 px-1">
                <div className="text-[10px] uppercase font-semibold text-slate-400 px-2 mb-1">
                  Preview Role (RBAC)
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['viewer', 'operator', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setProfileDropdownOpen(false);
                      }}
                      className={`py-1.5 text-center rounded-lg uppercase text-[10px] font-bold tracking-wider transition ${
                        activeRole === r
                          ? 'bg-[#00FFC6]/20 text-[#00FFC6] border border-[#00FFC6]/40'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1">
                <button
                  onClick={() => {
                    onNavigate('themes');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Theme Studio</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Account & Settings</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
