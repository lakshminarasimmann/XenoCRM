import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bot, Search, Sparkles } from 'lucide-react';
import Tilt from 'react-parallax-tilt';

export default function Audience() {
  const [segments, setSegments] = useState<any[]>([]);
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/segments');
      setSegments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    
    setIsGenerating(true);
    setResult(null);

    try {
      const res = await axios.post('http://localhost:3000/api/segments', { prompt, name });
      setResult(res.data);
      fetchSegments();
      setPrompt('');
      setName('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <header className="page-header" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', color: 'white', marginBottom: '8px' }}>Audience Builder</h1>
        <p style={{ fontSize: '15px' }}>Describe the users you want to reach, and our AI will build the segment instantly.</p>
      </header>

      <div className="grid-cols-2" style={{ gridTemplateColumns: '3fr 2fr', alignItems: 'stretch' }}>
        {/* Chat Interface */}
        <Tilt tiltMaxAngleX={1} tiltMaxAngleY={1} transitionSpeed={1500} style={{ height: '100%' }}>
          <div className="glass-panel flex-col" style={{ position: 'relative', height: '600px', overflow: 'hidden', padding: '0', display: 'flex' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', zIndex: 1 }}>
              {!result && !isGenerating && (
                <div className="flex-col flex-center" style={{ height: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Bot size={32} color="var(--text-main)" />
                  </div>
                  <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '12px', fontWeight: 600 }}>What's your goal?</h3>
                  <p style={{ maxWidth: '360px', fontSize: '14px', lineHeight: 1.6 }}>Try asking: "Find customers who spent more than $100 but haven't bought anything in 6 months"</p>
                </div>
              )}

              {isGenerating && (
                <div className="flex-row animate-pulse" style={{ alignItems: 'flex-start', marginTop: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={16} color="black" />
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', borderTopLeftRadius: 0, maxWidth: '80%', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '14px', color: 'white' }}>Translating natural language to Prisma queries...</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="flex-col" style={{ gap: '24px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                     <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', borderTopRightRadius: 0, maxWidth: '80%' }}>
                       <p style={{ fontSize: '14px', color: 'white' }}>"{result.segment.name}"</p>
                     </div>
                  </div>

                  <div className="flex-row" style={{ alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Sparkles size={16} color="white" />
                    </div>
                    <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-md)', borderTopLeftRadius: 0, flex: 1 }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'white', fontSize: '15px', fontWeight: 600 }}>
                        Segment Created Successfully
                      </h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Found <strong style={{ color: 'white' }}>{result.segment.size}</strong> matching customers in your database.
                      </p>
                      
                      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-muted)', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
                        {result.segment.criteria}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleGenerate} style={{ padding: '20px', background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border-color)', zIndex: 1 }}>
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Optional: Name your segment"
                  className="input-field"
                  style={{ fontSize: '13px', padding: '10px 14px', background: 'var(--bg-card)' }}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Describe your audience..."
                  className="input-field"
                  style={{ background: 'var(--bg-card)', paddingRight: '48px', fontSize: '14px', padding: '14px 16px' }}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  disabled={isGenerating}
                  className="btn-primary"
                  style={{ position: 'absolute', right: '6px', top: '6px', bottom: '6px', padding: '0 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Sparkles size={16} /> Generate
                </button>
              </div>
            </form>
          </div>
        </Tilt>

        {/* Existing Segments List */}
        <Tilt tiltMaxAngleX={1} tiltMaxAngleY={1} transitionSpeed={1500} style={{ height: '100%' }}>
          <div className="glass-panel flex-col" style={{ height: '600px', padding: '24px' }}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', color: 'white', fontWeight: 600 }}>Saved Segments</h3>
              <div style={{ padding: '6px', background: 'var(--bg-sidebar)', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <Search size={14} />
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {segments.map(seg => (
                <div key={seg.id} style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--bg-input)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-sidebar)'; }}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{seg.name}</h4>
                    <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                      {seg.size} users
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{seg.criteria}</p>
                </div>
              ))}
            </div>
          </div>
        </Tilt>
      </div>
    </div>
  );
}
