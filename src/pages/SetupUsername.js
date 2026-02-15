import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { doc, updateDoc, query, collection, where, getDocs, getDoc } from 'firebase/firestore';
import './SetupUsername.css';

function SetupUsername() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const currentUser = auth.currentUser;

  // Redirect if no user or user already has username
  useEffect(() => {
    const checkUsername = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

      if (userDoc.exists() && userDoc.data().username) {
        // User already has username, go to dashboard
        navigate('/dashboard');
      }
    };

    checkUsername();
  }, [currentUser, navigate]);

  // Check if username is available (debounced)
  const checkUsernameAvailability = async (name) => {
    if (name.length < 3) {
      return;
    }

    setChecking(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', name.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('Username already taken');
      } else {
        setError('');
      }
    } catch (err) {
      console.error('Error checking username:', err);
    } finally {
      setChecking(false);
    }
  };

  // Handle username change with validation
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    
    // Only allow alphanumeric and underscore
    if (!/^[a-zA-Z0-9_]*$/.test(value)) {
      setError('Only letters, numbers, and underscore allowed');
      return;
    }

    setUsername(value);
    setError('');

    // Check availability after user stops typing
    if (value.length >= 3) {
      checkUsernameAvailability(value);
    } else if (value.length > 0 && value.length < 3) {
      setError('Username must be at least 3 characters');
    }
  };

  // Handle username submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]*$/.test(username)) {
      setError('Only letters, numbers, and underscore allowed');
      return;
    }

    setLoading(true);

    try {
      // Double-check availability (in case multiple requests)
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('Username already taken');
        setLoading(false);
        return;
      }

      // Update user profile with username
      await updateDoc(doc(db, 'users', currentUser.uid), {
        username: username.toLowerCase()
      });

      setSuccess('Username set successfully! ✓');

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError('Error setting username. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-box">
        <h1>Create Your Username</h1>
        <p className="subtitle">Choose a unique username for your profile link</p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <div className="username-input-group">
              <span className="prefix">localhost/profile/</span>
              <input
                type="text"
                placeholder="e.g., sid, john_doe, alice123"
                value={username}
                onChange={handleUsernameChange}
                maxLength="20"
                disabled={loading}
              />
              {checking && <span className="checking">Checking...</span>}
              {!error && username.length >= 3 && !checking && (
                <span className="available">✓ Available</span>
              )}
            </div>
            <div className="char-count">{username.length}/20</div>
            <p className="rules">
              • Minimum 3 characters<br />
              • Letters, numbers, underscore only<br />
              • Lowercase (we'll convert it)
            </p>
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              checking ||
              !username ||
              username.length < 3 ||
              error !== ''
            }
            className="btn-create"
          >
            {loading ? 'Creating...' : 'Create Username'}
          </button>
        </form>

        <p className="info">
          You can change this later in your profile settings
        </p>
      </div>
    </div>
  );
}

export default SetupUsername;
