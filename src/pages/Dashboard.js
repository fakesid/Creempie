import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [profileLink, setProfileLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messageFilter, setMessageFilter] = useState('all'); // 'all', 'anonymous', 'fan'

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }

        // Get user profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        }

        // Generate shareable link using username
        const userDocData = userDoc.data();
        if (userDocData && userDocData.username) {
          const link = `${window.location.origin}/profile/${userDocData.username}`;
          setProfileLink(link);
        }

        // Listen for messages in real-time
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, where('receiverId', '==', currentUser.uid));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const messagesList = [];
          querySnapshot.forEach((doc) => {
            messagesList.push({ id: doc.id, ...doc.data() });
          });
          // Sort by date, but also put fan messages first
          messagesList.sort((a, b) => {
            // Fan messages first
            if (a.messageType === 'fan' && b.messageType !== 'fan') return -1;
            if (a.messageType !== 'fan' && b.messageType === 'fan') return 1;
            // Then by date
            return b.createdAt - a.createdAt;
          });
          setMessages(messagesList);
        });

        setLoading(false);
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Filter messages based on selected filter
  const filteredMessages = messages.filter(msg => {
    if (messageFilter === 'all') return true;
    if (messageFilter === 'anonymous') return msg.messageType !== 'fan';
    if (messageFilter === 'fan') return msg.messageType === 'fan';
    return true;
  });

  // Calculate counts
  const anonymousCount = messages.filter(m => m.messageType !== 'fan').length;
  const fanCount = messages.filter(m => m.messageType === 'fan').length;

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>Dashboard</h1>
              <p>Welcome, {user?.displayName || 'User'}!</p>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container dashboard-main">
        {/* Profile Link Section */}
        <section className="profile-link-section">
          <h2>📍 Your Profile Link</h2>
          <p>Share this link on your bio to let people know about you</p>
          <div className="link-box">
            <input
              type="text"
              value={profileLink}
              readOnly
              className="link-input"
            />
            <button onClick={copyToClipboard} className="btn-copy">
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </section>

        {/* Messages Section */}
        <section className="messages-section">
          <div className="messages-header">
            <h2>📬 Your Messages</h2>
          </div>

          {/* Message Type Tabs */}
          <div className="message-tabs">
            <button
              className={`tab-button ${messageFilter === 'all' ? 'active' : ''}`}
              onClick={() => setMessageFilter('all')}
            >
              <span className="tab-icon">📬</span>
              <span className="tab-label">All</span>
              <span className="tab-count">{messages.length}</span>
            </button>

            <button
              className={`tab-button ${messageFilter === 'anonymous' ? 'active' : ''}`}
              onClick={() => setMessageFilter('anonymous')}
            >
              <span className="tab-icon">🔒</span>
              <span className="tab-label">Anonymous</span>
              <span className="tab-count">{anonymousCount}</span>
            </button>

            <button
              className={`tab-button ${messageFilter === 'fan' ? 'active' : ''}`}
              onClick={() => setMessageFilter('fan')}
            >
              <span className="tab-icon">⭐</span>
              <span className="tab-label">Fan Messages</span>
              <span className="tab-count">{fanCount}</span>
            </button>
          </div>

          {filteredMessages.length === 0 ? (
            <p className="no-messages">
              {messageFilter === 'all' && 'No messages yet. Share your profile link to receive messages!'}
              {messageFilter === 'anonymous' && 'No anonymous messages yet.'}
              {messageFilter === 'fan' && 'No fan messages yet. Encourage people to send you fan messages!'}
            </p>
          ) : (
            <div className="messages-list">
              {filteredMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message-card ${msg.messageType === 'fan' ? 'fan-message' : 'anonymous-message'}`}
                >
                  <div className="message-header">
                    <span className="message-from">
                      {msg.messageType === 'fan' ? '⭐ Fan Message' : '🔒 Anonymous'}
                    </span>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="btn-delete"
                      title="Delete message"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="message-content">{msg.content}</p>
                  <span className="message-date">
                    {new Date(msg.createdAt?.toDate?.() || msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
