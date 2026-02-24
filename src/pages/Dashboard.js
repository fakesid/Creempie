import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { ThemeContext } from '../App';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import logo from '../mylogo.png';
import { FiEdit2, FiSun, FiMoon, FiCheck, FiX, FiLink, FiCopy, FiShare2, FiTrash2, FiSend, FiMessageCircle, FiLock, FiStar, FiMail, FiInbox, FiHome, FiUser, FiLogOut, FiBell } from 'react-icons/fi';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [profileLink, setProfileLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messageFilter, setMessageFilter] = useState('all'); // 'all', 'anonymous', 'fan'
  const [activeChatMessage, setActiveChatMessage] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    photoURL: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
          setHeaderHidden(true);
        } else if (currentScrollY < lastScrollY.current) {
          setHeaderHidden(false);
        }
        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(profileLink).catch(() => {
        fallbackCopy(profileLink);
      });
    } else {
      fallbackCopy(profileLink);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const deleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const acceptFanMessage = async (messageId) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        status: 'accepted'
      });
    } catch (error) {
      console.error('Error accepting message:', error);
    }
  };

  const rejectFanMessage = async (messageId) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        status: 'rejected'
      });
    } catch (error) {
      console.error('Error rejecting message:', error);
    }
  };

  const startEditProfile = () => {
    if (user) {
      setEditForm({
        displayName: user.displayName || '',
        bio: user.bio || '',
        photoURL: user.photoURL || ''
      });
      setEditMode(true);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    
    if (!editForm.displayName.trim()) {
      alert('Display name is required');
      return;
    }

    setSavingProfile(true);

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          displayName: editForm.displayName.trim(),
          bio: editForm.bio.trim(),
          photoURL: editForm.photoURL.trim()
        });

        setUser(prev => ({
          ...prev,
          ...editForm
        }));

        setEditMode(false);
        alert('✓ Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditForm({
      displayName: '',
      bio: '',
      photoURL: ''
    });
  };

  const changeTheme = async (newTheme) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          theme: newTheme
        });
        themeContext.setTheme(newTheme);
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const currentUser = auth.currentUser;
      const newDarkMode = !themeContext.isDarkMode;
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          isDarkMode: newDarkMode
        });
        themeContext.setIsDarkMode(newDarkMode);
      }
    } catch (error) {
      console.error('Error updating dark mode:', error);
    }
  };

  const openChatForMessage = async (message) => {
    setActiveChatMessage(message);
    setChatInput('');
    
    // Fetch existing chat messages for this session
    try {
      const chatRef = collection(db, 'chatMessages');
      const q = query(chatRef, where('messageId', '==', message.id));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const chats = [];
        snapshot.forEach(doc => {
          chats.push(doc.data());
        });
        // Sort by date
        chats.sort((a, b) => a.createdAt - b.createdAt);
        setChatMessages(chats);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const sendChatFromHolder = async (e) => {
    e.preventDefault();

    if (!chatInput.trim()) {
      return;
    }

    setSendingChat(true);

    try {
      await addDoc(collection(db, 'chatMessages'), {
        messageId: activeChatMessage.id,
        sessionToken: activeChatMessage.sessionToken,
        receiverId: activeChatMessage.receiverId,
        senderType: 'holder',
        content: chatInput.trim(),
        createdAt: serverTimestamp()
      });

      setChatInput('');
    } catch (error) {
      console.error('Error sending chat:', error);
    } finally {
      setSendingChat(false);
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
      <header className={`dashboard-header${headerHidden ? ' header-hidden' : ''}`}>
        <div className="container">
          <div className="header-content">
            <div className="header-brand">
              <img src={logo} alt="Ghostalk" className="header-logo" />
              <span className="header-app-name">Ghostalk</span>
            </div>
            <div className="header-menu-wrapper">
              <button
                className="btn-notification"
                aria-label="Notifications"
                onClick={() => document.querySelector('.messages-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <FiBell />
                {messages.length > 0 && <span className="notif-badge">{messages.length}</span>}
              </button>
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="btn-menu-toggle"
                aria-label="Menu"
              >
                <span className={`menu-icon ${menuOpen ? 'open' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>

              {menuOpen && (
                <>
                  <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
                  <div className="dropdown-menu">
                    <button onClick={() => { startEditProfile(); setMenuOpen(false); }} className="menu-item">
                      <span className="menu-item-icon"><FiEdit2 /></span>
                      <span>Edit Profile</span>
                    </button>
                    <div className="menu-divider" />
                    <div className="menu-section-label">Theme</div>
                    <div className="menu-theme-colors">
                      {['purple', 'blue', 'green', 'red', 'orange'].map(color => (
                        <button
                          key={color}
                          className={`menu-color-btn ${themeContext?.theme === color ? 'active' : ''}`}
                          onClick={() => changeTheme(color)}
                          title={color.charAt(0).toUpperCase() + color.slice(1)}
                          style={{
                            backgroundColor: color === 'purple' ? '#8B5CF6' :
                                            color === 'blue' ? '#3B82F6' :
                                            color === 'green' ? '#10B981' :
                                            color === 'red' ? '#EF4444' : '#F97316'
                          }}
                        >
                          {themeContext?.theme === color && <FiCheck size={12} />}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => { toggleDarkMode(); setMenuOpen(false); }} className="menu-item">
                      <span className="menu-item-icon">{themeContext?.isDarkMode ? <FiSun /> : <FiMoon />}</span>
                      <span>{themeContext?.isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <div className="menu-divider" />
                    <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="menu-item menu-item-danger">
                      <span className="menu-item-icon">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container dashboard-main">
        {/* Edit Profile Section */}
        {editMode ? (
          <section className="edit-profile-section">
            <h2><FiEdit2 style={{marginRight: 8}} /> Edit Profile</h2>
            <form onSubmit={saveProfile} className="edit-form">
              <div className="form-group">
                <label>Display Name *</label>
                <input
                  type="text"
                  placeholder="Your display name"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                  className="form-input"
                  maxLength="50"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  placeholder="Tell people about yourself..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="form-textarea"
                  maxLength="150"
                  rows="3"
                />
                <div className="char-count">{editForm.bio.length}/150</div>
              </div>

              <div className="form-group">
                <label>Photo URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={editForm.photoURL}
                  onChange={(e) => setEditForm({...editForm, photoURL: e.target.value})}
                  className="form-input"
                />
                <p className="help-text">Paste a link to your photo (JPG, PNG)</p>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-save"
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving...' : <><FiCheck style={{marginRight: 4}} /> Save Profile</>}
                </button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={cancelEdit}
                >
                  <FiX style={{marginRight: 4}} /> Cancel
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section className="profile-card-section">
            <div className="profile-card">
              <div className="profile-left">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user?.displayName} className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="profile-right">
                <h3>{user?.displayName || 'No name set'}</h3>
                {user?.bio && <p className="profile-bio">{user.bio}</p>}
                <p className="profile-username">@{user?.username || 'username'}</p>
              </div>
            </div>
            <div className="link-row">
              <span className="link-share-icon"><FiLink /></span>
              <span className="link-text">{profileLink.replace(/^https?:\/\//, '')}</span>
              <button onClick={copyToClipboard} className="link-inline-btn link-inline-copy">
                {copied ? <FiCheck /> : <FiCopy />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: `${user?.displayName}'s Profile`, url: profileLink });
                } else {
                  copyToClipboard();
                }
              }} className="link-inline-btn link-inline-share">
                <FiShare2 />
                <span>Share</span>
              </button>
            </div>
          </section>
        )}

        {/* Messages Section */}
        <section className="messages-section">
          <div className="messages-header">
            <h2><FiInbox style={{marginRight: 8}} /> Your Messages</h2>
          </div>

          {/* Message Type Tabs */}
          <div className="message-tabs">
            <button
              className={`tab-button ${messageFilter === 'all' ? 'active' : ''}`}
              onClick={() => setMessageFilter('all')}
            >
              <span className="tab-icon"><FiInbox /></span>
              <span className="tab-label">All</span>
              <span className="tab-count">{messages.length}</span>
            </button>

            <button
              className={`tab-button ${messageFilter === 'anonymous' ? 'active' : ''}`}
              onClick={() => setMessageFilter('anonymous')}
            >
              <span className="tab-icon"><FiLock /></span>
              <span className="tab-label">Anonymous</span>
              <span className="tab-count">{anonymousCount}</span>
            </button>

            <button
              className={`tab-button ${messageFilter === 'fan' ? 'active' : ''}`}
              onClick={() => setMessageFilter('fan')}
            >
              <span className="tab-icon"><FiStar /></span>
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
                  className={`message-card ${msg.messageType === 'fan' ? 'fan-message' : 'anonymous-message'} ${msg.status === 'accepted' ? 'accepted-status' : msg.status === 'rejected' ? 'rejected-status' : ''}`}
                >
                  <div className="message-header">
                    <span className="message-from">
                      {msg.messageType === 'fan' ? <><FiStar style={{marginRight: 4}} /> Fan Message</> : <><FiLock style={{marginRight: 4}} /> Anonymous</>}
                      {msg.status && msg.status !== 'pending' && (
                        <span className="message-status">
                          {msg.status === 'accepted' ? <> <FiCheck size={12} /> Accepted</> : <> <FiX size={12} /> Rejected</>}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="btn-delete"
                      title="Delete message"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <p className="message-content">{msg.content}</p>
                  
                  {/* Fan Message Actions */}
                  {msg.messageType === 'fan' && msg.status === 'pending' && (
                    <div className="fan-actions">
                      <button
                        onClick={() => acceptFanMessage(msg.id)}
                        className="btn-accept"
                        title="Accept this fan message to enable conversation"
                      >
                        <FiCheck style={{marginRight: 4}} /> Accept & Enable Chat
                      </button>
                      <button
                        onClick={() => rejectFanMessage(msg.id)}
                        className="btn-reject"
                        title="Reject this fan message"
                      >
                        <FiX style={{marginRight: 4}} /> Reject
                      </button>
                    </div>
                  )}

                  {/* Session Info for Accepted Fan Messages */}
                  {msg.messageType === 'fan' && msg.status === 'accepted' && msg.sessionToken && (
                    <div className="session-info">
                      <p className="session-label"><FiLink style={{marginRight: 4}} /> Chat Session Enabled</p>
                      <p className="session-details">
                        Token expires: {new Date(msg.sessionExpiresAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => openChatForMessage(msg)}
                        className="btn-chat-holder"
                        title="Open chat for this fan message"
                      >
                        <FiMessageCircle style={{marginRight: 4}} /> Open Chat
                      </button>
                    </div>
                  )}

                  <span className="message-date">
                    {new Date(msg.createdAt?.toDate?.() || msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Chat Session for Account Holder */}
        {activeChatMessage && (
          <section className="chat-section-holder">
            <div className="chat-box-holder">
              <div className="chat-header-holder">
                <h2><FiMessageCircle style={{marginRight: 8}} /> Chat with Fan</h2>
                <button 
                  className="btn-close-chat"
                  onClick={() => setActiveChatMessage(null)}
                  title="Close chat"
                >
                  <FiX style={{marginRight: 4}} /> Close
                </button>
              </div>

              <div className="chat-info-holder">
                <p className="fan-initial-message">
                  <strong>Fan's Message:</strong> "{activeChatMessage.content}"
                </p>
                <p className="chat-session-time">
                  Session expires: {new Date(activeChatMessage.sessionExpiresAt).toLocaleDateString()}
                </p>
              </div>

              <div className="chat-messages-holder">
                {/* Initial Message */}
                <div className="chat-msg fan-initial-msg">
                  <div className="msg-bubble">
                    <p>{activeChatMessage.content}</p>
                    <span className="msg-time">Fan's initial message</span>
                  </div>
                </div>

                {/* Conversation */}
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`chat-msg ${msg.senderType === 'holder' ? 'holder-msg' : 'fan-msg'}`}
                  >
                    <div className="msg-bubble">
                      <p>{msg.content}</p>
                      <span className="msg-time">
                        {msg.senderType === 'holder' ? 'You' : 'Fan'} • {new Date(msg.createdAt?.toDate?.() || msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendChatFromHolder} className="chat-form-holder">
                <div className="chat-input-wrapper">
                  <input
                    type="text"
                    placeholder="Type your response..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="chat-input-holder"
                    maxLength="300"
                  />
                  <button
                    type="submit"
                    disabled={sendingChat || !chatInput.trim()}
                    className="btn-send-holder"
                  >
                    {sendingChat ? '...' : <FiSend />}
                  </button>
                </div>
                <div className="chat-counter">{chatInput.length}/300</div>
              </form>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <FiHome />
          <span>Dashboard</span>
        </button>
        <button
          className={`bottom-nav-item ${activeTab === 'inbox' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('inbox');
            document.querySelector('.messages-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <FiInbox />
          {messages.length > 0 && <span className="nav-badge">{messages.length}</span>}
          <span>Inbox</span>
        </button>
        <button
          className="bottom-nav-item nav-share-btn"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: `${user?.displayName}'s Profile`, url: profileLink });
            } else {
              copyToClipboard();
            }
          }}
        >
          <FiShare2 />
          <span>Share</span>
        </button>
        <button
          className={`bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => { setActiveTab('profile'); startEditProfile(); }}
        >
          <FiUser />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default Dashboard;
