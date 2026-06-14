import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function Logo3D({ size = 120 }: { size?: number }) {
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  const rotateX = useTransform(y, [0, 400], [25, -25]);
  const rotateY = useTransform(x, [0, 400], [-25, 25]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  function handleMouseLeave() {
    x.set(200);
    y.set(200);
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1000,
        margin: '0 auto',
      }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          rotateX: rotateX,
          rotateY: rotateY,
          transformStyle: "preserve-3d",
          position: 'relative'
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Layer 1: Base Shadow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%)', filter: 'blur(20px)', opacity: 0.5, transform: 'translateZ(-30px)' }}></div>

        {/* Layer 2: Outline Blob */}
        <svg width="100%" height="100%" viewBox="-20 -20 140 140" fill="none" style={{ position: 'absolute', inset: 0, transform: 'translateZ(-10px)' }}>
          <path
            d="M50 15C69.33 15 85 30.67 85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15Z"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="4"
            fill="rgba(59, 130, 246, 0.05)"
          />
        </svg>

        {/* Layer 3: Main Blob */}
        <svg width="100%" height="100%" viewBox="-20 -20 140 140" fill="none" style={{ position: 'absolute', inset: 0, transform: 'translateZ(0px)' }}>
          <path
            d="M50 15C69.33 15 85 30.67 85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15Z"
            stroke="var(--primary)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="rgba(24, 24, 27, 0.8)"
            style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))' }}
          />
        </svg>

        {/* Layer 4: Floating Dots */}
        <svg width="100%" height="100%" viewBox="-20 -20 140 140" fill="none" style={{ position: 'absolute', inset: 0, transform: 'translateZ(20px)' }}>
          <circle cx="30" cy="30" r="10" fill="var(--primary)" style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }} />
          <circle cx="70" cy="30" r="10" fill="rgba(255, 255, 255, 0.9)" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))' }} />
          <circle cx="30" cy="70" r="10" fill="rgba(147, 197, 253, 0.9)" style={{ filter: 'drop-shadow(0 0 8px rgba(147, 197, 253, 0.5))' }} />
          <circle cx="70" cy="70" r="10" fill="var(--primary)" style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }} />
        </svg>
      </motion.div>
    </div>
  );
}
