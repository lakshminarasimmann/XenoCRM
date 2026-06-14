import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Audience from './pages/Audience';
import Campaigns from './pages/Campaigns';

type AuthState = 'logged_out' | 'welcoming' | 'logged_in';

function App() {
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>('logged_out');

  useEffect(() => {
    // Simulate initial load and AI engine startup
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (authState === 'logged_out') {
    return <Login onLogin={() => setAuthState('welcoming')} />;
  }

  if (authState === 'welcoming') {
    return <Welcome onComplete={() => setAuthState('logged_in')} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="audience" element={<Audience />} />
          <Route path="campaigns" element={<Campaigns />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
