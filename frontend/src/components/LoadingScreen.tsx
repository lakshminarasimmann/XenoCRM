import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 10 }}
      >
        <svg width="100" height="100" viewBox="-20 -20 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Animated SVG Path for the Xeno Logo Blob */}
          <motion.path
            d="M50 15C69.33 15 85 30.67 85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15Z"
            stroke="var(--primary)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            fill="rgba(255, 255, 255, 0.05)"
          />
          <motion.circle cx="30" cy="30" r="10" fill="var(--primary)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} />
          <motion.circle cx="70" cy="30" r="10" fill="var(--text-muted)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} />
          <motion.circle cx="30" cy="70" r="10" fill="var(--border-hover)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
          <motion.circle cx="70" cy="70" r="10" fill="var(--accent-blue)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
        </svg>
        <motion.h1 
          style={{ fontSize: '48px', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-main)', margin: 0 }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
        >
          xeno
        </motion.h1>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 }}
      >
        Initializing Engine
      </motion.p>
    </div>
  );
}
