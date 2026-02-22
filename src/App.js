import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SetupUsername from './pages/SetupUsername';
import Dashboard from './pages/Dashboard';
import ProfileShare from './pages/ProfileShare';

import './App.css';

// Theme context
export const ThemeContext = React.createContext();

const themes = {
  purple: { name: 'Purple', primary: '#667eea', secondary: '#764ba2', bg: '#f5f5f5', bgDark: '#1a1a1a' },
  blue: { name: 'Ocean Blue', primary: '#0066cc', secondary: '#0052a3', bg: '#f5f5f5', bgDark: '#1a1a1a' },
  green: { name: 'Forest Green', primary: '#00a86b', secondary: '#008c4a', bg: '#f5f5f5', bgDark: '#1a1a1a' },
  red: { name: 'Crimson Red', primary: '#dc143c', secondary: '#b71c1c', bg: '#f5f5f5', bgDark: '#1a1a1a' },
  orange: { name: 'Sunset Orange', primary: '#ff6b35', secondary: '#cc5428', bg: '#f5f5f5', bgDark: '#1a1a1a' }
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasUsername, setHasUsername] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(true);
  const [theme, setTheme] = useState('purple');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if user is logged in and has username
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Check if user has username and load theme
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().username) {
            setHasUsername(true);
          } else {
            setHasUsername(false);
          }
          
          // Load user theme preference
          if (userDoc.exists() && userDoc.data().theme) {
            setTheme(userDoc.data().theme);
          }
          if (userDoc.exists() && userDoc.data().isDarkMode) {
            setIsDarkMode(userDoc.data().isDarkMode);
          }
        } catch (error) {
          console.error('Error checking username:', error);
          setHasUsername(false);
        }
      }

      setCheckingUsername(false);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Apply theme as CSS variables
  useEffect(() => {
    const currentTheme = themes[theme] || themes.purple;
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', currentTheme.primary);
    root.style.setProperty('--color-secondary', currentTheme.secondary);
    root.style.setProperty('--color-bg', isDarkMode ? currentTheme.bgDark : currentTheme.bg);
    root.style.setProperty('--text-color', isDarkMode ? '#fff' : '#333');
    
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme, isDarkMode]);

  if (loading || checkingUsername) {
    return <div className="container"><p>Loading...</p></div>;
  }

  const themeContextValue = {
    theme,
    setTheme,
    isDarkMode,
    setIsDarkMode,
    themes,
    currentTheme: themes[theme] || themes.purple
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <Router>
        <Routes>
          {/* Landing page for everyone (will redirect logged-in users) */}
          <Route
            path="/"
            element={
              user ? (
                hasUsername ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Navigate to="/setup-username" />
                )
              ) : (
                <Landing />
              )
            }
          />

          {/* If not logged in, show login page */}
          <Route path="/login" element={<Login />} />

          {/* Setup username (only for logged-in users without username) */}
          <Route
            path="/setup-username"
            element={user && !hasUsername ? <SetupUsername /> : <Navigate to="/dashboard" />}
          />

          {/* Public profile view (anyone can access) */}
          <Route path="/profile/:username" element={<ProfileShare />} />

          {/* Protected dashboard (only logged in users) */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;
