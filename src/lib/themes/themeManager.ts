import { Theme } from '../../types';
import { THEME_PRESETS } from './presets';

export const DEFAULT_THEME_ID = 'ghost-neon';

export function getThemeById(id: string): Theme {
  return THEME_PRESETS.find((t) => t.id === id) || THEME_PRESETS[0];
}

export function applyTheme(theme: Theme, event?: React.MouseEvent | MouseEvent) {
  const root = document.documentElement;

  // Set CSS variables
  root.style.setProperty('--color-accent', theme.tokens.accent);
  root.style.setProperty('--color-accent-hover', theme.tokens.accentHover);
  root.style.setProperty('--color-accent-muted', theme.tokens.accentMuted);
  root.style.setProperty('--color-secondary', theme.tokens.secondary);
  root.style.setProperty('--color-bg-dark', theme.tokens.bgDark);
  root.style.setProperty('--color-bg-card', theme.tokens.bgCard);
  root.style.setProperty('--color-bg-surface', theme.tokens.bgSurface);
  root.style.setProperty('--color-text-primary', theme.tokens.textPrimary);
  root.style.setProperty('--color-text-muted', theme.tokens.textMuted);
  root.style.setProperty('--color-border', theme.tokens.border);
  root.style.setProperty('--color-gap-glow', theme.tokens.gapGlow);
  root.style.setProperty('--color-ghost-ideal', theme.tokens.ghostIdeal);

  // Set font family
  if (theme.fontFamily === 'JetBrains Mono') {
    root.style.setProperty('--font-main', '"JetBrains Mono", monospace');
  } else if (theme.fontFamily === 'Inter') {
    root.style.setProperty('--font-main', '"Inter", sans-serif');
  } else {
    root.style.setProperty('--font-main', '"Space Grotesk", sans-serif');
  }

  // Set radius
  const radius = theme.cornerRadius === 'sharp' ? '0px' : theme.cornerRadius === 'pill' ? '24px' : '12px';
  root.style.setProperty('--radius-theme', radius);

  // Set dark/light class
  if (theme.mode === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }

  // Optional circular reveal wipe
  if (event && (document as any).startViewTransition) {
    // If View Transitions API is supported, let the browser animate
  }
}
