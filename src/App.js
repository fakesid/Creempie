import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Pages
import Login from './pages/Login';
import SetupUsername from './pages/SetupUsername';
import Dashboard from './pages/Dashboard';
import ProfileShare from './pages/ProfileShare';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasUsername, setHasUsername] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(true);

  useEffect(() => {
    // Check if user is logged in and has username
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Check if user has username
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().username) {
            setHasUsername(true);
          } else {
            setHasUsername(false);
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

  if (loading || checkingUsername) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <Router>
      <Routes>
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

        {/* Redirect home to dashboard or login */}
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
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
