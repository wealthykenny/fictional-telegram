import { motion } from 'framer-motion';

export function LoadingScreen({ onComplete }) {
  return (
    <div className="loading-wrap" onAnimationEnd={onComplete}>
      <motion.div
        className="robot-track"
        initial={{ x: -140 }}
        animate={{ x: 140 }}
        transition={{ duration: 1.5, repeat: 1, repeatType: 'reverse', ease: 'easeInOut' }}
        onAnimationComplete={onComplete}
      >
        <svg width="120" height="90" viewBox="0 0 120 90" role="img" aria-label="Robot walking">
          <rect x="34" y="22" width="52" height="36" rx="10" className="robot-core" />
          <circle cx="48" cy="40" r="5" className="robot-eye" />
          <circle cx="72" cy="40" r="5" className="robot-eye" />
          <rect x="44" y="8" width="32" height="18" rx="8" className="robot-core" />
          <line x1="60" y1="8" x2="60" y2="2" className="robot-limb" />
          <circle cx="60" cy="2" r="2.5" className="robot-eye" />
          <line x1="40" y1="58" x2="26" y2="76" className="robot-limb" />
          <line x1="80" y1="58" x2="94" y2="76" className="robot-limb" />
          <line x1="38" y1="30" x2="20" y2="44" className="robot-limb" />
          <line x1="82" y1="30" x2="100" y2="44" className="robot-limb" />
        </svg>
      </motion.div>
      <h1>Flex4Genz</h1>
      <p>Booting AWS-powered image lab...</p>
    </div>
  );
}
