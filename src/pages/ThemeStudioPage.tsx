import React, { useState } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Sparkles,
  Download,
  Upload,
  Check,
  Eye,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { THEME_PRESETS } from '../lib/themes/presets';
import { Theme } from '../types';
import { sound } from '../lib/sound/soundEffects';

export const ThemeStudioPage: React.FC = () => {
  const { currentThemeId, setTheme, customTheme, activeRole } = useAppStore();

  const [activeTheme, setActiveTheme] = useState<Theme>(
    customTheme || THEME_PRESETS.find((t) => t.id === currentThemeId) || THEME_PRESETS[0]
  );

  const [customAccent, setCustomAccent] = useState(activeTheme.tokens.accent);
  const [customRadius, setCustomRadius] = useState(activeTheme.cornerRadius);
  const [customFont, setCustomFont] = useState(activeTheme.fontFamily);
  const [customBlur, setCustomBlur] = useState(activeTheme.glassBlur);

  const handleSelectPreset = (preset: Theme, e: React.MouseEvent) => {
    sound.playClick();
    setActiveTheme(preset);
    setCustomAccent(preset.tokens.accent);
    setCustomRadius(preset.cornerRadius);
    setCustomFont(preset.fontFamily);
    setCustomBlur(preset.glassBlur);
    setTheme(preset.id);
  };

  const handleApplyCustom = () => {
    sound.playGhostBusted();
    const updated: Theme = {
      ...activeTheme,
      id: 'custom_' + Date.now(),
      name: 'Custom Theme',
      custom: true,
      fontFamily: customFont,
      cornerRadius: customRadius,
      glassBlur: customBlur,
      tokens: {
        ...activeTheme.tokens,
        accent: customAccent,
        accentHover: customAccent,
      },
    };
    setActiveTheme(updated);
    setTheme(updated.id, updated);
  };

  const handleExportThemeJson = () => {
    sound.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeTheme, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `voltghost-theme-${activeTheme.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 m-0">
            <Palette className="w-6 h-6 text-[#00FFC6]" />
            <span>Theme Studio & Design Tokens</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic live CSS variables affecting typography, glassmorphism, charts, and 3D scene lighting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportThemeJson}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-bold transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#00FFC6]" />
            <span>Export Theme JSON</span>
          </button>
        </div>
      </div>

      {/* Built-in Presets (7 Presets) */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-white">7 Official Facility Presets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {THEME_PRESETS.map((preset) => {
            const isSelected = currentThemeId === preset.id;

            return (
              <div
                key={preset.id}
                onClick={(e) => handleSelectPreset(preset, e)}
                style={{
                  backgroundColor: preset.tokens.bgDark,
                  borderColor: isSelected ? preset.tokens.accent : preset.tokens.border,
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative group hover:scale-102 ${
                  isSelected ? 'shadow-[0_0_25px_rgba(0,255,198,0.25)]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: preset.tokens.textPrimary }}>
                    {preset.name}
                  </span>
                  {isSelected && (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-black"
                      style={{ backgroundColor: preset.tokens.accent }}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Color Swatch Dots */}
                <div className="flex gap-2 mt-4">
                  <span
                    className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: preset.tokens.accent }}
                  />
                  <span
                    className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: preset.tokens.secondary }}
                  />
                  <span
                    className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: preset.tokens.bgCard }}
                  />
                  <span
                    className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: preset.tokens.gapGlow }}
                  />
                </div>

                <div className="text-[10px] mt-3 font-mono" style={{ color: preset.tokens.textMuted }}>
                  Mode: {preset.mode.toUpperCase()} • {preset.fontFamily}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Theme Builder */}
      <div className="glass-panel p-6 rounded-3xl space-y-5">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Custom Theme Token Builder</h3>
            <p className="text-xs text-slate-400">
              Customize accent hex, glass blur, density, and typography in real time.
            </p>
          </div>
          <button
            onClick={handleApplyCustom}
            className="px-5 py-2 bg-[var(--color-accent,#00FFC6)] hover:brightness-110 text-black font-extrabold rounded-xl text-xs transition shadow-lg shadow-[var(--color-accent,#00FFC6)]/20"
          >
            Apply Custom Theme
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Accent Color */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customAccent}
                onChange={(e) => setCustomAccent(e.target.value)}
                className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={customAccent}
                onChange={(e) => setCustomAccent(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Typography */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Font Family</label>
            <select
              value={customFont}
              onChange={(e) => setCustomFont(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-[#0F172A] border border-white/10 rounded-xl text-xs text-white"
            >
              <option value="Space Grotesk">Space Grotesk (Modern)</option>
              <option value="Inter">Inter (Clean)</option>
              <option value="JetBrains Mono">JetBrains Mono (Industrial)</option>
            </select>
          </div>

          {/* Corner Radius */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Corner Radius</label>
            <select
              value={customRadius}
              onChange={(e) => setCustomRadius(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-[#0F172A] border border-white/10 rounded-xl text-xs text-white"
            >
              <option value="sharp">Sharp (0px)</option>
              <option value="normal">Normal (12px)</option>
              <option value="pill">Pill (24px)</option>
            </select>
          </div>

          {/* Glass Blur */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Glass Blur</label>
            <select
              value={customBlur}
              onChange={(e) => setCustomBlur(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-[#0F172A] border border-white/10 rounded-xl text-xs text-white"
            >
              <option value="none">None (Solid)</option>
              <option value="subtle">Subtle (8px)</option>
              <option value="heavy">Heavy (16px)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
