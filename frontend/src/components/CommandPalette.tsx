import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, Send, X } from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const actions = [
    { id: 'dashboard', name: 'Go to Dashboard', icon: LayoutDashboard, route: '/' },
    { id: 'audience', name: 'Build AI Audience', icon: Users, route: '/audience' },
    { id: 'campaign', name: 'Dispatch Campaign', icon: Send, route: '/campaigns' },
  ];

  const filteredActions = actions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (route: string) => {
    navigate(route);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="modal-overlay" onClick={() => setIsOpen(false)} style={{ alignItems: 'flex-start', paddingTop: '15vh' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden', maxWidth: '600px', background: 'rgba(15, 15, 20, 0.8)', backdropFilter: 'blur(30px)', border: '1px solid var(--border-hover)', boxShadow: '0 0 50px rgba(0, 240, 255, 0.1)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <Search size={20} color="var(--primary)" style={{ marginRight: '16px' }} />
          <input
            autoFocus
            type="text"
            placeholder="Search commands or jump to... (Ctrl+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '16px', outline: 'none', fontFamily: 'var(--font-sans)' }}
          />
          <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '8px' }}>
          <p style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Navigation
          </p>
          {filteredActions.length === 0 ? (
            <p style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '14px' }}>No commands found.</p>
          ) : (
            filteredActions.map((action, idx) => (
              <div
                key={action.id}
                onClick={() => handleSelect(action.route)}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-main)'; }}
                style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', cursor: 'pointer', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', transition: 'all 0.2s', gap: '16px', border: '1px solid transparent' }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <action.icon size={16} />
                </div>
                <span style={{ fontSize: '15px', fontWeight: 500 }}>{action.name}</span>
                {idx === 0 && query === '' && (
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>↵ Return</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
