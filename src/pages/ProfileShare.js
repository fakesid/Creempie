import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import './ProfileShare.css';

function ProfileShare() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('anonymous'); // 'anonymous' or 'fan'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({ totalMessages: 0, fans: 0 });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Query for user by username
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setUser(userData);
          setUserId(userDoc.id);

          // Fetch stats
          const messagesRef = collection(db, 'messages');
          const messagesQuery = query(messagesRef, where('receiverId', '==', userDoc.id));
          const messagesSnapshot = await getDocs(messagesQuery);
          
          let totalMessages = messagesSnapshot.size;
          let fanMessages = 0;
          messagesSnapshot.forEach(doc => {
            if (doc.data().messageType === 'fan') {
              fanMessages++;
            }
          });

          setStats({
            totalMessages: totalMessages,
            fans: fanMessages
          });
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError('Error loading profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    if (message.length > 500) {
      setError('Message must be less than 500 characters');
      return;
    }

    if (!userId) {
      setError('User not found');
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      await addDoc(collection(db, 'messages'), {
        receiverId: userId,
        content: message,
        messageType: messageType, // 'anonymous' or 'fan'
        createdAt: serverTimestamp(),
        isRead: false
      });

      setSuccess(`${messageType === 'fan' ? '⭐ Fan' : 'Anonymous'} message sent successfully! ✓`);
      setMessage('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

      // Update stats
      setStats(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        fans: messageType === 'fan' ? prev.fans + 1 : prev.fans
      }));
    } catch (err) {
      setError('Error sending message. Please try again.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-landing">
        <div className="loading-state">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="profile-landing">
        <div className="error-state">
          <h2>404 - User Not Found</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-landing">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-bg"></div>
        
        <div className="profile-header-section">
          <div className="profile-pic-container">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user?.displayName} className="profile-pic" />
            ) : (
              <div className="profile-pic-placeholder">
                {user?.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
            {stats.fans > 0 && <span className="fan-badge">⭐ {stats.fans}</span>}
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{user?.displayName}</h1>
            <p className="profile-username">@{username}</p>
            {user?.bio && <p className="profile-bio">{user.bio}</p>}
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-number">{stats.totalMessages}</div>
            <div className="stat-label">Messages</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.fans}</div>
            <div className="stat-label">Fans</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalMessages > 0 ? Math.round((stats.fans / stats.totalMessages) * 100) : 0}%</div>
            <div className="stat-label">Fan Rate</div>
          </div>
        </div>
      </div>

      {/* Message Section */}
      <div className="message-section">
        <div className="message-container">
          <h2>Send Message</h2>
          
          {error && <div className="error-alert">{error}</div>}
          {success && <div className="success-alert">{success}</div>}

          {/* Message Type Selector */}
          <div className="message-type-selector">
            <div 
              className={`type-option ${messageType === 'anonymous' ? 'active' : ''}`}
              onClick={() => {
                setMessageType('anonymous');
                setError('');
              }}
            >
              <div className="type-icon">🔒</div>
              <div className="type-name">Anonymous</div>
              <div className="type-desc">Send quietly</div>
            </div>

            <div 
              className={`type-option ${messageType === 'fan' ? 'active' : ''}`}
              onClick={() => {
                setMessageType('fan');
                setError('');
              }}
            >
              <div className="type-icon">⭐</div>
              <div className="type-name">Fan Message</div>
              <div className="type-desc">Get highlighted</div>
            </div>
          </div>

          {/* Message Info */}
          <div className="message-info">
            {messageType === 'anonymous' && (
              <p>💡 Your message will be completely anonymous</p>
            )}
            {messageType === 'fan' && (
              <p>⭐ Your message will be highlighted as a fan message and get priority visibility</p>
            )}
          </div>

          <form onSubmit={handleSendMessage}>
            <div className="form-group">
              <textarea
                placeholder={messageType === 'anonymous' ? 
                  "Write your anonymous message here..." : 
                  "Write your fan message here..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength="500"
                rows="5"
                className="message-input"
              />
              <div className="character-count">
                {message.length}/500
              </div>
            </div>

            <button
              type="submit"
              disabled={sending || !message.trim()}
              className={`btn-send ${messageType}`}
            >
              {sending ? (
                <>
                  <span className="spinner"></span>
                  {messageType === 'fan' ? 'Sending Fan Message...' : 'Sending Anonymous Message...'}
                </>
              ) : (
                <>
                  {messageType === 'fan' ? '⭐ Send as Fan' : '🔒 Send Anonymously'}
                </>
              )}
            </button>
          </form>

          <div className="message-footer">
            <p>Messages are stored securely and can be deleted anytime</p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="footer-section">
        <p>Want your own profile?</p>
        <a href="/login" className="btn-create-profile">Create Your Profile</a>
      </div>
    </div>
  );
}

export default ProfileShare;
