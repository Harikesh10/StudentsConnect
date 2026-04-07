import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Clubs from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import Chat from './pages/Chat';
import Applications from './pages/Applications';
import socketService from './services/socket';
import MaplaBot from './components/MaplaBot';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Connect to socket
      socketService.connect();
      socketService.setUserOnline(parsedUser.id);
      socketService.joinChat(parsedUser.id);
    }

    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    socketService.connect();
    socketService.setUserOnline(userData.id);
    socketService.joinChat(userData.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socketService.disconnect();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/search"
          element={user ? <Search user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/clubs"
          element={user ? <Clubs user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/clubs/:id"
          element={user ? <ClubDetail user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={user ? <Chat user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat/:userId"
          element={user ? <Chat user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/applications"
          element={user ? <Applications user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
      {user && <MaplaBot user={user} />}
    </Router>
  );
}

export default App;
