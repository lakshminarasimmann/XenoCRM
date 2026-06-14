import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';

export default function Layout() {
  return (
    <div className="app-layout">
      {/* Background Ambience Layers */}
      <div className="ambient-bg">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
      </div>
      
      <Sidebar />
      <div className="main-container">
        <div className="main-content-wrapper">
          <Outlet />
        </div>
      </div>

      {/* Global Modals */}
      <CommandPalette />
    </div>
  );
}
