import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { TOKEN_KEY } from './utils/api';

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    // api.js fires this when the server rejects our token (expired / invalid).
    const onLogout = () => setLoggedIn(false);
    window.addEventListener('ustad-logout', onLogout);
    return () => window.removeEventListener('ustad-logout', onLogout);
  }, []);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setLoggedIn(false);
  };

  return loggedIn
    ? <Dashboard onLogout={logout} />
    : <Login onLogin={() => setLoggedIn(true)} />;
}

export default App;
