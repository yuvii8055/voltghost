import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Sparkles } from 'lucide-react';
import { sound } from '../../lib/sound/soundEffects';

export const EasterEggGhost: React.FC = () => {
  const [triggered, setTriggered] = useState(false);
  const [typedBuffer, setTypedBuffer] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      const newBuffer = (typedBuffer + e.key.toLowerCase()).slice(-5);
      setTypedBuffer(newBuffer);

      if (newBuffer.endsWith('boo')) {
        setTriggered(true);
        sound.playGhostBusted();
        setTimeout(() => setTriggered(false), 4500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [typedBuffer]);

  if (!triggered) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <motion.div
        initial={{ x: '-15vw', y: '80vh', scale: 0.6, opacity: 0, rotate: -20 }}
        animate={{
          x: ['0vw', '45vw', '110vw'],
          y: ['80vh', '30vh', '10vh'],
          scale: [0.6, 1.4, 1.1],
          opacity: [0, 0.9, 0],
          rotate: [-20, 15, -10],
        }}
        transition={{ duration: 4.2, ease: 'easeInOut' }}
        className="flex flex-col items-center drop-shadow-[0_0_35px_rgba(0,255,198,0.8)]"
      >
        <Ghost className="w-28 h-28 text-[#00FFC6]" />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 border border-[#00FFC6]/60 text-xs font-mono font-bold text-[#00FFC6] mt-2">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>BOO! You found an Energy Ghost!</span>
        </div>
      </motion.div>
    </div>
  );
};
