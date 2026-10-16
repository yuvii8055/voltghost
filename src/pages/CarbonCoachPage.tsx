import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Send,
  Volume2,
  VolumeX,
  FileText,
  Copy,
  Check,
  TrendingUp,
  Coins,
  Leaf,
  Wrench,
  Globe,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { askCarbonCoach } from '../lib/ai/geminiClient';
import { PersonaMode, Language, CoachContext } from '../lib/ai/offlineCoach';
import { voiceAssistant } from '../lib/ai/voiceAssistant';
import { generateSustainabilityReport } from '../lib/export/pdfReport';
import { Strategy } from '../types';
import { sound } from '../lib/sound/soundEffects';

interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  strategies?: Strategy[];
}

interface CarbonCoachPageProps {
  onNavigate: (page: string) => void;
}

export const CarbonCoachPage: React.FC<CarbonCoachPageProps> = ({ onNavigate }) => {
  const {
    equipment,
    ghostEvents,
    totalWastedKwh,
    totalCostInr,
    totalCo2Kg,
    tariffPerKwh,
    emissionFactor,
    setIslandState,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState<PersonaMode>('engineer');
  const [language, setLanguage] = useState<Language>('en');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm_init',
      sender: 'coach',
      text: `Hello! I am Carbon Coach, your industrial energy efficiency and ESG expert. Telemetry from 12 machines is live. How can I assist you in hunting energy ghosts today?`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    sound.playClick();
    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setIslandState({
      type: 'ai_streaming',
      title: 'Carbon Coach Thinking',
      message: `Analyzing telemetry for: "${textToSend.slice(0, 30)}..."`,
    });

    const context: CoachContext = {
      equipment,
      ghostEvents,
      totalWastedKwh,
      totalCostInr,
      totalCo2Kg,
      tariffPerKwh,
      emissionFactor,
      persona,
      language,
    };

    let streamBuffer = '';
    const coachMsgId = 'coach_' + Date.now();

    try {
      const response = await askCarbonCoach(textToSend, context, (chunk) => {
        streamBuffer = chunk;
        setMessages((prev) => {
          const exists = prev.find((m) => m.id === coachMsgId);
          if (exists) {
            return prev.map((m) => (m.id === coachMsgId ? { ...m, text: chunk } : m));
          } else {
            return [
              ...prev,
              {
                id: coachMsgId,
                sender: 'coach',
                text: chunk,
                timestamp: new Date().toLocaleTimeString(),
              },
            ];
          }
        });
      });

      setMessages((prev) => {
        const withoutStreaming = prev.filter((m) => m.id !== coachMsgId);
        return [
          ...withoutStreaming,
          {
            id: coachMsgId,
            sender: 'coach',
            text: response.text,
            timestamp: new Date().toLocaleTimeString(),
            strategies: response.strategies,
          },
        ];
      });

      if (ttsEnabled) {
        voiceAssistant.speak(
          response.text.slice(0, 180),
          language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-US'
        );
      }

      setIslandState({
        type: 'idle',
        title: 'VoltGhost Monitoring',
        message: 'Hunting energy ghosts live',
      });
    } catch {
      // Handled in geminiClient
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportPDF = () => {
    sound.playClick();
    generateSustainabilityReport(
      equipment,
      ghostEvents,
      totalWastedKwh,
      totalCostInr,
      totalCo2Kg
    );
  };

  const suggestedChips = [
    'Generate Action Plan',
    'Which machine is wasting the most?',
    'Explain the CNC unattended ghost',
    'How do I lower our peak demand kW?',
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      {/* Top Bar with Personas, Language, and PDF Export */}
      <div className="glass-panel p-3 px-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight m-0">Carbon Coach AI</h3>
              <div className="text-[10px] text-slate-400">Grounded in Live Telemetry & SCADA Context</div>
            </div>
          </div>

          {/* Persona Mode Switcher */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            {(
              [
                { id: 'engineer', label: 'Engineer' },
                { id: 'cfo', label: 'CFO (ROI)' },
                { id: 'eco', label: 'Eco (CO₂)' },
                { id: 'eli10', label: 'ELI10' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  sound.playClick();
                  setPersona(p.id);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  persona === p.id
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Language Selector */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {(
              [
                { id: 'en', label: 'EN' },
                { id: 'hi', label: 'हिन्दी' },
                { id: 'kn', label: 'ಕನ್ನಡ' },
              ] as const
            ).map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  sound.playClick();
                  setLanguage(l.id);
                }}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition ${
                  language === l.id
                    ? 'bg-[#00FFC6]/20 text-[#00FFC6]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* TTS Voice Toggle */}
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 rounded-xl border transition ${
              ttsEnabled
                ? 'bg-[#00FFC6]/15 border-[#00FFC6]/40 text-[#00FFC6]'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
            title={ttsEnabled ? 'Spoken Voice Replies ON' : 'Voice Replies Muted'}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Weekly Sustainability Report PDF Button */}
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white font-bold transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#00FFC6]" />
            <span>Generate PDF Audit Report</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Stream Viewport */}
      <div className="flex-1 overflow-y-auto glass-panel p-5 rounded-3xl space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-purple-600/30 border border-purple-500/40 text-white'
                  : 'bg-white/5 border border-white/10 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 pb-1 border-b border-white/5">
                <span className="font-bold flex items-center gap-1.5">
                  {msg.sender === 'coach' ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-purple-300">Carbon Coach</span>
                    </>
                  ) : (
                    <span>You</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span>{msg.timestamp}</span>
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="hover:text-white"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Message text with basic Markdown formatting */}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Render Strategy Cards if provided */}
              {msg.strategies && (
                <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                  <div className="text-xs font-bold text-[#00FFC6] uppercase tracking-wider">
                    Ranked Mitigation Action Plan
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {msg.strategies.map((strat, idx) => (
                      <div
                        key={strat.id}
                        className="p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-purple-400/50 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">
                              #{idx + 1} {strat.title}
                            </span>
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">
                              {strat.confidenceScore}% Confidence
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{strat.description}</p>

                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded font-mono">
                              Save ₹{strat.savingsInrPerYear.toLocaleString()}/yr
                            </span>
                            <span className="text-[10px] bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded font-mono">
                              {strat.co2SavedKgPerYear.toLocaleString()} kg CO₂/yr
                            </span>
                            <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded font-mono">
                              Payback: {strat.paybackMonths} mo
                            </span>
                            <span className="text-[10px] bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded font-mono">
                              Effort: {strat.effort}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-end">
                          <button
                            onClick={() => onNavigate('whatif')}
                            className="px-3 py-1 bg-[#00FFC6] hover:bg-[#33ffdc] text-black text-xs font-bold rounded-lg transition flex items-center gap-1"
                          >
                            <span>Simulate this on Twin</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-300 p-3 bg-purple-950/20 rounded-xl border border-purple-500/30 w-fit">
            <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
            <span>Carbon Coach is generating telemetry insights...</span>
          </div>
        )}
      </div>

      {/* Suggested Query Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] text-slate-400 whitespace-nowrap">Suggested:</span>
        {suggestedChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 whitespace-nowrap transition"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Message Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="glass-panel p-2 rounded-2xl flex items-center gap-2 shrink-0 border border-white/15"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Carbon Coach (e.g. 'Generate Action Plan', 'Explain the chiller overcooling')..."
          className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 bg-[#00FFC6] hover:bg-[#33ffdc] disabled:opacity-40 text-black font-bold rounded-xl transition flex items-center justify-center shadow-lg shadow-[#00FFC6]/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
