import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
      <motion.div
        className="relative h-32 w-32 rounded-full border-4 border-gold"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 h-16 w-1 -translate-x-1/2 -translate-y-full bg-crimson"
          animate={{ rotate: [-20, 20, -20] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        />
      </motion.div>
      <motion.h1
        className="mt-8 font-cinzel text-3xl text-gold"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.8, 1] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        THE KNIGHT OF ORDER
      </motion.h1>
    </div>
  );
}
