import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle email signup/login
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Create new user
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: email,
          createdAt: new Date(),
          displayName: email.split('@')[0],
          bio: '',
          username: '' // Will be set in setup page
        });

        // Redirect to setup username page
        navigate('/setup-username');
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists to see if they have username
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      // Create/Update user profile in Firestore
      await setDoc(
        userDocRef,
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'User',
          photoURL: user.photoURL,
          createdAt: new Date(),
          bio: '',
          username: userDocSnap.exists() ? userDocSnap.data().username : '' // Keep existing username
        },
        { merge: true }
      );

      // If user already has username, go to dashboard, otherwise go to setup
      if (userDocSnap.exists() && userDocSnap.data().username) {
        navigate('/dashboard');
      } else {
        navigate('/setup-username');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Bio Link Share</h1>
        <p className="subtitle">Share your profile with your followers</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleEmailAuth}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="divider">OR</div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn-google"
        >
          {loading ? 'Loading...' : '🔵 Sign in with Google'}
        </button>

        <p className="toggle-auth">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="link-button"
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
