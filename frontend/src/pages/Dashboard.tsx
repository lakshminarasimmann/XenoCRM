import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, Activity, Users, Send, BrainCircuit, Rocket, Zap, Bot, Trash2 } from 'lucide-react';
import Tilt from 'react-parallax-tilt';

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [insights, setInsights] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteCampaign = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/campaigns/${id}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/campaigns`);
      setCampaigns(res.data);
      setLoading(false);
      
      res.data.forEach((camp: any) => {
        if (camp.status === 'COMPLETED' && !insights[camp.id]) {
          fetchInsight(camp.id);
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchInsights = async (id: string) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/campaigns/${id}/insights`);
      setInsights(prev => ({ ...prev, [id]: res.data.insights }));
    } catch (error) {
      console.error('Error fetching insight:', error);
    }
  };

  if (loading) {
    return <div className="text-muted flex-center" style={{ height: '50vh' }}><Activity className="animate-spin" size={24} /></div>;
  }

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Hero Section */}
      <div style={{ marginBottom: '64px', textAlign: 'center', paddingTop: '32px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px', letterSpacing: '-0.04em', color: 'white' }}>Welcome to Xeno</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          The intelligent engine for modern marketing. Build hyper-targeted audiences, dispatch campaigns on autopilot, and generate actionable insights.
        </p>
      </div>

      {/* Feature Modules */}
      <div className="grid-cols-3" style={{ marginBottom: '64px' }}>
        <Tilt tiltMaxAngleX={4} tiltMaxAngleY={4} glareEnable={true} glareMaxOpacity={0.05} glareColor="#ffffff" glarePosition="all" transitionSpeed={2000}>
          <div className="glass-panel flex-col" style={{ height: '100%', padding: '32px 24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Users size={24} color="var(--text-main)" />
            </div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'white', fontWeight: 600 }}>AI Audience Builder</h2>
            <p className="text-muted" style={{ fontSize: '14px', lineHeight: 1.6 }}>Use natural language to instantly segment your database. The AI writes the complex queries for you.</p>
          </div>
        </Tilt>

        <Tilt tiltMaxAngleX={4} tiltMaxAngleY={4} glareEnable={true} glareMaxOpacity={0.05} glareColor="#ffffff" glarePosition="all" transitionSpeed={2000}>
          <div className="glass-panel flex-col" style={{ height: '100%', padding: '32px 24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Rocket size={24} color="var(--text-main)" />
            </div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'white', fontWeight: 600 }}>Campaign Autopilot</h2>
            <p className="text-muted" style={{ fontSize: '14px', lineHeight: 1.6 }}>Draft campaigns using AI, simulate delivery metrics, and validate the copy for maximum engagement before sending.</p>
          </div>
        </Tilt>

        <Tilt tiltMaxAngleX={4} tiltMaxAngleY={4} glareEnable={true} glareMaxOpacity={0.05} glareColor="#ffffff" glarePosition="all" transitionSpeed={2000}>
          <div className="glass-panel flex-col" style={{ height: '100%', padding: '32px 24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <BrainCircuit size={24} color="var(--text-main)" />
            </div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'white', fontWeight: 600 }}>Smart Insights</h2>
            <p className="text-muted" style={{ fontSize: '14px', lineHeight: 1.6 }}>After a campaign completes, the AI analyzes performance data and generates a post-mortem report outlining successes.</p>
          </div>
        </Tilt>
      </div>

      <div style={{ height: '1px', background: 'var(--border-color)', margin: '48px 0' }}></div>

      {/* Dashboard Stats */}
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <h2 className="flex-row" style={{ fontSize: '20px', color: 'white', fontWeight: 600 }}>Performance Dashboard</h2>
        <div className="badge badge-neutral"><Zap size={12} color="var(--text-muted)" style={{marginRight: '4px'}}/> LIVE DATA</div>
      </div>

      {campaigns.length === 0 ? (
        <div className="glass-panel flex-center" style={{ padding: '80px 0', borderStyle: 'dashed' }}>
          <div className="flex-col flex-center text-muted">
            <Send size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', color: 'white', marginBottom: '4px' }}>No campaigns yet</h3>
            <p style={{ fontSize: '14px' }}>Navigate to the AI Audience Builder to create your first segment.</p>
          </div>
        </div>
      ) : (
        <div className="grid-cols-2">
          {campaigns.map(camp => (
            <Tilt key={camp.id} tiltMaxAngleX={1} tiltMaxAngleY={1} transitionSpeed={2500} style={{ height: '100%' }}>
              <div className="glass-panel flex-col" style={{ height: '100%', gap: '20px' }}>
                <div className="flex-between">
                  <div>
                    <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '4px', fontWeight: 600 }}>{camp.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}><Users size={12} style={{display: 'inline', marginRight:'4px'}}/>{camp.segment.name}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className={`badge ${camp.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                      {camp.status}
                    </div>
                    <button 
                      onClick={(e) => handleDeleteCampaign(e, camp.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                      title="Delete Campaign"
                    >
                      <Trash2 size={16} className="hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>

                <div style={{ height: '200px', marginTop: '12px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Sent', value: camp.stats.total, fill: 'var(--border-hover)' },
                      { name: 'Delivered', value: camp.stats.delivered, fill: 'var(--text-muted)' },
                      { name: 'Opened', value: camp.stats.opened, fill: 'var(--text-main)' },
                      { name: 'Clicked', value: camp.stats.clicked, fill: 'var(--accent-blue)' },
                    ]}>
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'var(--bg-sidebar)'}} contentStyle={{ backgroundColor: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px' }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-panel">
                  <h2 className="flex-row" style={{ fontSize: '16px', marginBottom: '16px' }}>
                    <Bot size={18} color="var(--primary)" /> AI Optimization Insights
                  </h2>
                  <div className="flex-col" style={{ gap: '16px' }}>
                    <div className="flex-row" style={{ alignItems: 'flex-start', background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <Sparkles size={16} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Segment Potential</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>"Big Spenders" segment hasn't been engaged in 14 days. Highly recommended to send a VIP offer.</p>
                      </div>
                    </div>
                    <div className="flex-row" style={{ alignItems: 'flex-start', background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <Sparkles size={16} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Delivery Window</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Optimum send time for your audience is between 10 AM and 12 PM local time.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tilt>
          ))}
        </div>
      )}
    </div>
  );
}
