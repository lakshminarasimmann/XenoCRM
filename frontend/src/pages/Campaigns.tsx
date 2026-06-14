import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, Rocket, Loader, AlertTriangle, XCircle, BarChart3, Activity, Clock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';

export default function Campaigns() {
  const [segments, setSegments] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [prompt, setPrompt] = useState('');
  
  // A/B Testing Variants
  const [variants, setVariants] = useState<string[]>([]);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(null);
  
  const [messageTemplate, setMessageTemplate] = useState('');
  
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  
  const [mode, setMode] = useState<'autopilot' | 'manual'>('autopilot');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/segments`);
      setSegments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDraft = async () => {
    if (!segmentId || !prompt) return;
    setIsDrafting(true);
    setVariants([]);
    setSelectedVariantIdx(null);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/campaigns/draft`, { segmentId, prompt });
      setVariants(res.data.variants || []);
    } catch (error) {
      console.error('Draft failed', error);
    }
    setIsDrafting(false);
  };

  const selectVariant = (idx: number) => {
    setSelectedVariantIdx(idx);
    setMessageTemplate(variants[idx]);
    setMode('manual');
  };

  const handleSimulate = async () => {
    if (!segmentId || !messageTemplate) return;
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/campaigns/simulate`, {
        segmentId,
        messageTemplate
      });
      setSimulationResult(res.data);
    } catch (error) {
      console.error('Simulation failed', error);
    }
    setIsSimulating(false);
  };

  const handleValidationCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTemplate) return;
    
    setIsValidating(true);
    setValidationResult(null);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/campaigns/validate`, {
        messageTemplate
      });
      setValidationResult(res.data);
      
      if (res.data.status === 'PASS') {
        proceedWithDispatch();
      } else if (res.data.status === 'WARNING') {
        setShowWarningModal(true);
      }
    } catch (error) {
      console.error('Validation failed', error);
    }
    setIsValidating(false);
  };

  const proceedWithDispatch = async () => {
    setShowWarningModal(false);
    setIsDispatching(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/campaigns`, {
        name: name || `Campaign ${new Date().toLocaleDateString()}`,
        segmentId,
        messageTemplate
      });
      navigate('/');
    } catch (error) {
      console.error('Dispatch failed', error);
      setIsDispatching(false);
    }
  };

  const variantLabels = ['Aggressive / FOMO', 'Friendly / Casual', 'Direct / Value'];

  return (
    <div style={{ paddingBottom: '100px', position: 'relative', zIndex: 1 }}>
      <header className="page-header" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '40px', color: 'white', marginBottom: '8px' }}>Campaign Dispatcher</h1>
        <p style={{ fontSize: '16px' }}>AI-powered A/B generation, simulation, and validation.</p>
      </header>

      <div className="grid-cols-2" style={{ alignItems: 'flex-start' }}>
        {/* Left Column: Form & Editing */}
        <Tilt tiltMaxAngleX={1} tiltMaxAngleY={1} transitionSpeed={1500}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <form onSubmit={handleValidationCheck} className="flex-col" style={{ gap: '28px' }}>
              
              <div className="grid-cols-2" style={{ gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Campaign Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Winter Clearance"
                    className="input-field"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Target Audience</label>
                  <select 
                    className="input-field"
                    value={segmentId}
                    onChange={e => setSegmentId(e.target.value)}
                    required
                    style={{ appearance: 'none' }}
                  >
                    <option value="" disabled>Select a segment...</option>
                    {segments.map(seg => (
                      <option key={seg.id} value={seg.id}>
                        {seg.name} ({seg.size} users)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex-row" style={{ background: 'var(--bg-sidebar)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setMode('autopilot')}
                  className={`btn ${mode === 'autopilot' ? 'btn-primary' : ''}`}
                  style={{ flex: 1, background: mode === 'autopilot' ? '' : 'transparent', color: mode === 'autopilot' ? 'black' : 'var(--text-muted)' }}
                >
                  <Bot size={18} /> AI Autopilot
                </button>
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className={`btn ${mode === 'manual' ? 'btn-primary' : ''}`}
                  style={{ flex: 1, background: mode === 'manual' ? '' : 'transparent', color: mode === 'manual' ? 'black' : 'var(--text-muted)' }}
                >
                  <Send size={18} /> Manual Compose
                </button>
              </div>

              {mode === 'autopilot' ? (
                <div className="flex-col" style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                  <label className="input-label" style={{ color: 'var(--primary)', fontSize: '15px' }}>
                    <Sparkles size={18} style={{marginRight: '6px', color: 'var(--primary)'}}/> Describe Your Goal
                  </label>
                  <textarea
                    placeholder="E.g., 'Write a friendly SMS offering 20% off for our VIP customers. Keep it short.'"
                    className="input-field"
                    style={{ height: '100px', background: 'var(--bg-card)', fontSize: '15px' }}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleDraft}
                    disabled={isDrafting || !prompt || !segmentId}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '14px', borderColor: 'var(--primary)', color: 'var(--primary)', boxShadow: '0 0 15px rgba(0,240,255,0.1)' }}
                  >
                    {isDrafting ? <Loader className="animate-spin" size={18} /> : 'Generate A/B Variants'}
                  </button>

                  {/* Variants Display */}
                  {variants.length > 0 && (
                    <div className="flex-col" style={{ gap: '16px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                      <p style={{ fontSize: '14px', color: 'white', fontWeight: 600 }}>Select a winning variant:</p>
                      {variants.map((v, idx) => (
                        <div 
                          key={idx}
                          onClick={() => selectVariant(idx)}
                          style={{ 
                            padding: '16px', 
                            borderRadius: 'var(--radius-md)', 
                            border: `2px solid ${selectedVariantIdx === idx ? 'var(--primary)' : 'var(--border-color)'}`,
                            background: selectedVariantIdx === idx ? 'rgba(0,240,255,0.05)' : 'var(--bg-card)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                        >
                          {selectedVariantIdx === idx && (
                            <CheckCircle2 size={20} color="var(--primary)" style={{ position: 'absolute', top: '16px', right: '16px' }} />
                          )}
                          <div className="badge badge-neutral" style={{ marginBottom: '12px', background: 'rgba(255,255,255,0.05)' }}>
                            Variant {idx + 1}: {variantLabels[idx]}
                          </div>
                          <p style={{ fontSize: '15px', color: 'white', lineHeight: 1.5, paddingRight: selectedVariantIdx === idx ? '32px' : '0' }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: '15px' }}>Message Copy</label>
                  <textarea
                    placeholder="Hi there! We are offering 20% off..."
                    className="input-field"
                    style={{ height: '140px', fontSize: '15px' }}
                    value={messageTemplate}
                    onChange={e => setMessageTemplate(e.target.value)}
                    required
                  />
                  <div className="text-right" style={{ color: messageTemplate.length > 160 ? 'var(--accent-red)' : 'var(--primary)', fontSize: '13px', marginTop: '6px', fontWeight: 600 }}>
                    {messageTemplate.length}/160 characters
                  </div>
                </div>
              )}

              {/* Validation Status Banner */}
              {validationResult && validationResult.status === 'FAIL' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '20px', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)' }}>
                  <div className="flex-row" style={{ fontWeight: 600, fontSize: '15px', marginBottom: '12px' }}>
                    <XCircle size={18} /> Validation Failed
                  </div>
                  <ul className="flex-col" style={{ gap: '8px', marginLeft: '24px', fontSize: '14px' }}>
                    {validationResult.explanations?.map((ex: string, i: number) => <li key={i} style={{ display: 'list-item', listStyleType: 'disc' }}>{ex}</li>)}
                  </ul>
                </div>
              )}

              <div className="flex-row" style={{ paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  type="button"
                  onClick={handleSimulate}
                  disabled={isSimulating || !messageTemplate || !segmentId}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '16px' }}
                >
                  {isSimulating ? <Loader className="animate-spin" size={20} /> : 'Simulate Campaign'}
                </button>

                {validationResult?.status === 'FAIL' ? (
                  <button 
                    type="button" 
                    disabled={true}
                    className="btn"
                    style={{ flex: 1, padding: '16px', background: 'var(--bg-input)', color: 'var(--text-muted)', cursor: 'not-allowed', border: '1px solid var(--accent-red)' }}
                  >
                    Campaign Blocked for Spam
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={isValidating || isDispatching || !messageTemplate || !segmentId}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '16px' }}
                  >
                    {isValidating || isDispatching ? (
                      <Loader className="animate-spin" size={20} />
                    ) : (
                      <div className="flex-row flex-center">Validate & Launch <Rocket size={20} /></div>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </Tilt>

        {/* Right Column: Simulator Results */}
        <Tilt tiltMaxAngleX={1} tiltMaxAngleY={1} transitionSpeed={1500} style={{ height: '100%' }}>
          <div className="glass-panel flex-col" style={{ height: '100%', padding: '32px' }}>
            <h2 className="flex-row" style={{ fontSize: '20px', marginBottom: '24px', color: 'white' }}>
              <Activity size={24} color="var(--accent-green)" style={{ filter: 'drop-shadow(0 0 10px rgba(57,255,20,0.4))' }} />
              Simulation Engine
            </h2>
            
            {!simulationResult ? (
              <div className="flex-col flex-center text-center animate-fade-in" style={{ flex: 1, opacity: 0.5, padding: '40px' }}>
                <BarChart3 size={64} color="var(--text-muted)" style={{ marginBottom: '20px' }} />
                <p style={{ fontSize: '16px', lineHeight: 1.6 }}>Select an A/B variant and run a simulation to see predicted performance before sending.</p>
              </div>
            ) : (
              <div className="flex-col animate-fade-in" style={{ gap: '24px' }}>
                
                <div className="grid-cols-2" style={{ gap: '16px' }}>
                  <div style={{ padding: '20px', background: 'var(--bg-sidebar)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Est. Delivery</p>
                    <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-green)', textShadow: '0 0 15px rgba(57,255,20,0.3)' }}>{simulationResult.deliveryProbability}</p>
                  </div>
                  <div style={{ padding: '20px', background: 'var(--bg-sidebar)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Open Rate</p>
                    <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary)', textShadow: '0 0 15px rgba(0,240,255,0.3)' }}>{simulationResult.openRate}</p>
                  </div>
                  <div style={{ padding: '20px', background: 'var(--bg-sidebar)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>CTR</p>
                    <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-purple)', textShadow: '0 0 15px rgba(178,0,255,0.3)' }}>{simulationResult.ctr}</p>
                  </div>
                  <div style={{ padding: '20px', background: 'var(--bg-sidebar)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Spam Prob.</p>
                    <p style={{ fontSize: '28px', fontWeight: 700, color: parseInt(simulationResult.spamProbability) > 10 ? 'var(--accent-red)' : 'var(--text-main)' }}>
                      {simulationResult.spamProbability}
                    </p>
                  </div>
                </div>

                <div className="flex-between" style={{ background: 'var(--bg-sidebar)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <p className="flex-row" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-yellow)' }}>
                      <Clock size={18} /> Best Send Time
                    </p>
                    <p style={{ fontSize: '20px', marginTop: '6px', color: 'white', fontWeight: 700 }}>{simulationResult.recommendedTime}</p>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '6px' }}>Fatigue Score</p>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>{simulationResult.fatigueScore}</p>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-sidebar)', borderRadius: 'var(--radius-md)', padding: '24px', border: '1px solid var(--border-color)' }}>
                  <h3 className="flex-row" style={{ fontSize: '15px', marginBottom: '16px', color: 'white', fontWeight: 600 }}>
                    <Bot size={18} color="var(--primary)" /> AI Explanations
                  </h3>
                  <ul className="flex-col" style={{ gap: '14px' }}>
                    {simulationResult.explanations?.map((exp: string, idx: number) => (
                      <li key={idx} className="flex-row" style={{ alignItems: 'flex-start', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginTop: '8px', flexShrink: 0, boxShadow: '0 0 10px var(--primary-glow)' }} />
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Tilt>
      </div>

      {/* WARNING MODAL */}
      {showWarningModal && validationResult && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="text-center" style={{ marginBottom: '32px' }}>
              <div className="flex-center" style={{ marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245, 158, 11, 0.2)', boxShadow: '0 0 30px rgba(245,158,11,0.2)' }}>
                  <AlertTriangle size={40} />
                </div>
              </div>
              <h2 style={{ fontSize: '28px', marginBottom: '12px', color: 'white' }}>Validation Warning</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>The AI detected potential issues. Recommended to fix before sending.</p>
            </div>
            
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '32px' }}>
              <ul className="flex-col" style={{ gap: '12px', fontSize: '14px' }}>
                {validationResult.explanations?.map((ex: string, i: number) => (
                  <li key={i} className="flex-row" style={{ alignItems: 'flex-start' }}>
                    <ShieldAlert size={18} color="var(--accent-yellow)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ color: 'var(--text-main)', lineHeight: 1.5 }}>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid-cols-2" style={{ gap: '16px' }}>
              <button 
                onClick={() => setShowWarningModal(false)}
                className="btn btn-secondary"
                style={{ padding: '16px' }}
              >
                Go Back
              </button>
              <button 
                onClick={proceedWithDispatch}
                className="btn"
                style={{ background: 'var(--accent-yellow)', color: 'black', fontWeight: 700, padding: '16px', boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}
              >
                Send Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
