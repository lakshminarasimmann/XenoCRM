import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';
import Tilt from 'react-parallax-tilt';
import Logo3D from '../components/Logo3D';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'xeno') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Ambience */}
      <div className="ambient-bg">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
      </div>

      <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={true} glareMaxOpacity={0.05} glareColor="var(--primary)" glarePosition="all" scale={1.02} transitionSpeed={2000}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
          style={{ width: '100%', maxWidth: '440px', padding: '48px', background: 'var(--bg-card)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-color)', borderRadius: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)', position: 'relative', zIndex: 10 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <Logo3D size={80} />
            </div>
            <h1 style={{ fontSize: '32px', letterSpacing: '-0.04em', marginBottom: '8px', color: 'white', fontWeight: 800 }}>xeno engine</h1>
            <p className="text-muted" style={{ fontSize: '15px' }}>Enter the master password to access the dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ color: 'white', fontWeight: 600 }}>Master Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }}>
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: '44px', borderColor: error ? 'var(--accent-red)' : 'var(--border-color)', background: 'var(--bg-input)', padding: '14px 16px 14px 44px', fontSize: '15px' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
              {error && <p className="text-error" style={{ fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>Incorrect password. Please try again.</p>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '8px', border: 'none' }}>
              Authenticate <ArrowRight size={18} />
            </button>
          </form>
        </motion.div>
      </Tilt>

      <div style={{ position: 'absolute', bottom: '40px', fontSize: '13px', color: 'var(--text-muted)', zIndex: 10 }}>
        &copy; {new Date().getFullYear()} Xeno Enterprise
      </div>
    </div>
  );
}
