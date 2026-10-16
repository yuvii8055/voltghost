import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

export const CustomCursor: React.FC = () => {
  const { customCursorEnabled } = useAppStore();
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'restricted' | 'twin'>('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches || !customCursorEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check target element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest('[data-restricted]')) {
        setCursorType('restricted');
      } else if (target.closest('[data-twin-canvas]')) {
        setCursorType('twin');
      } else if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button'
      ) {
        setCursorType('pointer');
      } else {
        setCursorType('default');
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [customCursorEnabled, isVisible]);

  if (!customCursorEnabled || !isVisible) return null;

  return (
    <>
      {/* Background Radial Spotlight */}
      <div
        className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(650px circle at ${pos.x}px ${pos.y}px, var(--color-accent-muted, rgba(0, 255, 198, 0.06)), transparent 80%)`,
        }}
      />

      {/* Trailing Ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full border border-[var(--color-accent,#00FFC6)] opacity-70"
        animate={{
          x: pos.x - (cursorType === 'pointer' ? 24 : cursorType === 'twin' ? 28 : 16),
          y: pos.y - (cursorType === 'pointer' ? 24 : cursorType === 'twin' ? 28 : 16),
          width: cursorType === 'pointer' ? 48 : cursorType === 'twin' ? 56 : 32,
          height: cursorType === 'pointer' ? 48 : cursorType === 'twin' ? 56 : 32,
          borderColor: cursorType === 'restricted' ? '#EF4444' : 'var(--color-accent, #00FFC6)',
          scale: cursorType === 'pointer' ? 1.15 : 1,
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 450, mass: 0.2 }}
      />

      {/* Center Dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[10000] rounded-full bg-[var(--color-accent,#00FFC6)] shadow-lg"
        animate={{
          x: pos.x - 3,
          y: pos.y - 3,
          width: 6,
          height: 6,
          backgroundColor: cursorType === 'restricted' ? '#EF4444' : 'var(--color-accent, #00FFC6)',
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 900 }}
      />
    </>
  );
};
