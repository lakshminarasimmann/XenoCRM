import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Send } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Audience Builder', path: '/audience', icon: Users },
    { name: 'Campaigns', path: '/campaigns', icon: Send },
  ];

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h1 className="logo-title">
          <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="15" fill="var(--text-main)"/>
            <circle cx="70" cy="30" r="15" fill="var(--text-main)"/>
            <circle cx="30" cy="70" r="15" fill="var(--text-main)"/>
            <circle cx="70" cy="70" r="15" fill="var(--text-main)"/>
          </svg>
          xeno
        </h1>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="user-profile-badge">
        <div className="avatar-circle"></div>
        <div className="flex-col" style={{ gap: '2px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>Marketer Profile</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pro Tier</p>
        </div>
      </div>
    </div>
  );
}
