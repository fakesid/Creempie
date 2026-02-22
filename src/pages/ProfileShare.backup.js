import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import './ProfileShare.css';

// Generate session token (7 days = 604800000 ms)
const generateSessionToken = () => {
  const token = Math.random().toString(36).substr(2, 32) + Date.now().toString(36);
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  return { token, expiresAt };
};

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
  const [sessionToken, setSessionToken] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  useEffect(() => {
    // Setup real-time listener for active chat session
    if (!activeSession) return;

    const chatRef = collection(db, 'chatMessages');
    const q = query(chatRef, where('messageId', '==', activeSession.messageId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = [];
      snapshot.forEach(doc => {
        chats.push(doc.data());
      });
      // Sort by date
      chats.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.() || a.createdAt || 0;
        const timeB = b.createdAt?.toDate?.() || b.createdAt || 0;
        return timeA - timeB;
      });
      setChatMessages(chats);
    });

    return () => unsubscribe();
  }, [activeSession]);

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
      let messageData = {
        receiverId: userId,
        content: message,
        messageType: messageType, // 'anonymous' or 'fan'
        createdAt: serverTimestamp(),
        isRead: false,
        status: 'pending' // 'pending', 'accepted', 'rejected'
      };

      // Generate session token for fan messages
      if (messageType === 'fan') {
        const { token, expiresAt } = generateSessionToken();
        messageData.sessionToken = token;
        messageData.sessionExpiresAt = expiresAt;
        setSessionToken({ token, expiresAt });
        setShowTokenModal(true);
      }

      await addDoc(collection(db, 'messages'), messageData);

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

  const verifyToken = async (e) => {
    e.preventDefault();
    
    if (!tokenInput.trim()) {
      setError('Please enter your session token');
      return;
    }

    setVerifyingToken(true);
    setError('');

    try {
      // Query for the message with this token (without status filter first)
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('sessionToken', '==', tokenInput.trim()),
        where('receiverId', '==', userId),
        where('messageType', '==', 'fan')
      );
      
      const querySnapshot = await getDocs(q);

      // Check if token exists
      if (querySnapshot.empty) {
        setError('🔴 Token not found. Please check if you copied it correctly or send a new fan message.');
        return;
      }

      const messageDoc = querySnapshot.docs[0];
      const messageData = messageDoc.data();

      // Check if message has been rejected
      if (messageData.status === 'rejected') {
        setError('❌ This message was rejected by the account holder. You can send a new fan message to try again.');
        return;
      }

      // Check if message is still pending (not accepted yet)
      if (messageData.status === 'pending') {
        setError('⏳ This message hasn\'t been accepted yet. The account holder is reviewing it. Please try again later!');
        return;
      }

      // Check if token is expired
      if (messageData.sessionExpiresAt < Date.now()) {
        setError('⏰ Session token has expired. Please send a new fan message to get a new token.');
        return;
      }

      // All checks passed - token is valid
      setActiveSession({
        messageId: messageDoc.id,
        token: tokenInput.trim(),
        expiresAt: messageData.sessionExpiresAt,
        initialMessage: messageData.content
      });

      setChatMessages([]);
      setTokenInput('');
      setSuccess('✓ Session verified! You can now chat.');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Error verifying token. Please try again.');
      console.error(err);
    } finally {
      setVerifyingToken(false);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();

    if (!chatInput.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setSendingChat(true);
    setError('');

    try {
      await addDoc(collection(db, 'chatMessages'), {
        sessionToken: activeSession.token,
        messageId: activeSession.messageId,
        receiverId: userId,
        senderType: 'fan',
        content: chatInput.trim(),
        createdAt: serverTimestamp()
      });

      setChatMessages(prev => [...prev, {
        senderType: 'fan',
        content: chatInput.trim(),
        createdAt: new Date()
      }]);

      setChatInput('');
    } catch (err) {
      setError('Error sending message. Please try again.');
      console.error(err);
    } finally {
      setSendingChat(false);
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

      {/* Token Input / Chat Section */}
      {!activeSession && (
        <div className="token-input-section">
          <div className="token-container">
            <h2>🎫 Already a Fan?</h2>
            <p>Enter your session token to continue chatting</p>
            
            {error && <div className="error-alert">{error}</div>}
            {success && <div className="success-alert">{success}</div>}

            <form onSubmit={verifyToken} className="token-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Paste your session token here..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="token-input"
                />
              </div>

              <button
                type="submit"
                disabled={verifyingToken || !tokenInput.trim()}
                className="btn-verify-token"
              >
                {verifyingToken ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  '✓ Verify Token'
                )}
              </button>
            </form>

            <div className="token-help">
              <p>💡 <strong>Don't have a token?</strong> Send a fan message below to get one!</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Chat Session */}
      {activeSession && (
        <div className="chat-session-section">
          <div className="chat-container">
            <div className="chat-header">
              <h2>💬 Fan Chat Session</h2>
              <button 
                className="btn-end-chat"
                onClick={() => setActiveSession(null)}
                title="End chat session"
              >
                ✕ End Session
              </button>
            </div>

            <div className="chat-info">
              <span className="session-expires">
                Expires: {new Date(activeSession.expiresAt).toLocaleDateString()} {new Date(activeSession.expiresAt).toLocaleTimeString()}
              </span>
            </div>

            {/* Initial Message */}
            <div className="chat-messages">
              <div className="chat-message fan-side">
                <div className="message-bubble">
                  <p className="message-text">{activeSession.initialMessage}</p>
                  <span className="message-time">Your message</span>
                </div>
              </div>

              {/* Follow-up Messages */}
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`chat-message ${msg.senderType === 'holder' ? 'holder-side' : 'fan-side'}`}
                >
                  <div className="message-bubble">
                    <p className="message-text">{msg.content}</p>
                    <span className="message-time">
                      {msg.senderType === 'holder' ? 'Account Holder' : 'You'} • {new Date(msg.createdAt?.toDate?.() || msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={sendChatMessage} className="chat-form">
              <div className="chat-input-group">
                <input
                  type="text"
                  placeholder="Send a follow-up message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="chat-input"
                  maxLength="300"
                />
                <button
                  type="submit"
                  disabled={sendingChat || !chatInput.trim()}
                  className="btn-send-chat"
                >
                  {sendingChat ? '...' : '📤'}
                </button>
              </div>
              <div className="chat-char-count">{chatInput.length}/300</div>
            </form>
          </div>
        </div>
      )}

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

      {/* Session Token Modal */}
      {showTokenModal && sessionToken && (
        <div className="modal-overlay" onClick={() => setShowTokenModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTokenModal(false)}>✕</button>
            
            <div className="token-header">
              <h2>⭐ Fan Session Token Generated</h2>
              <p>Valid for 7 days</p>
            </div>

            <div className="token-info">
              <p className="info-text">Your session token has been generated! Save it to continue chatting if the account holder accepts your message.</p>
              
              <div className="token-display">
                <div className="token-label">Your Session Token:</div>
                <div className="token-box">
                  <code className="token-text">{sessionToken.token}</code>
                  <button 
                    className="btn-copy-token"
                    onClick={() => {
                      navigator.clipboard.writeText(sessionToken.token);
                      alert('Token copied to clipboard!');
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div className="token-timeline">
                <div className="timeline-item">
                  <span className="timeline-number">1</span>
                  <span className="timeline-text">Your message was sent as a fan message</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-number">2</span>
                  <span className="timeline-text">The account holder reviews your message</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-number">3</span>
                  <span className="timeline-text">If accepted, you can continue chatting using this token</span>
                </div>
              </div>

              <div className="token-terms">
                <p>💡 <strong>Note:</strong> This token expires in 7 days. After expiration, you'll need to send a new fan message to re-establish contact.</p>
              </div>
            </div>

            <button 
              className="btn-close-modal"
              onClick={() => setShowTokenModal(false)}
            >
              Got It, Thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileShare;
