import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo/logo.png';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing">
      {/* Navigation */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logo} alt="BioLink" className="logo-img" />
            <span className="logo-text">BioLink</span>
          </div>
          <div className="nav-buttons">
            <button className="nav-btn nav-btn-ghost" onClick={() => navigate('/login')}>
              Log in
            </button>
            <button className="nav-btn nav-btn-primary" onClick={() => navigate('/login')}>
              Sign up free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Now with real-time fan chat
            </div>
            <h1 className="hero-title">
              Your world in<br />
              <span className="gradient-text">one link</span>
            </h1>
            <p className="hero-subtitle">
              Create a beautiful bio page, receive anonymous messages,
              and chat with your fans — all from one shareable link.
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={() => navigate('/login')}>
                Get started — it's free
              </button>
              <button className="btn-hero-secondary" onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                See how it works
              </button>
            </div>
            <div className="hero-social-proof">
              <div className="avatars-stack">
                <div className="mini-avatar" style={{ background: '#667eea' }}>S</div>
                <div className="mini-avatar" style={{ background: '#764ba2' }}>A</div>
                <div className="mini-avatar" style={{ background: '#00a86b' }}>R</div>
                <div className="mini-avatar" style={{ background: '#ff6b35' }}>M</div>
              </div>
              <p>Trusted by creators everywhere</p>
            </div>
          </div>
          <div className="hero-visual">
            <div className="phone-frame">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="screen-header"></div>
                <div className="screen-avatar">
                  <div className="screen-avatar-circle"></div>
                </div>
                <div className="screen-name-bar"></div>
                <div className="screen-bio-bar"></div>
                <div className="screen-links">
                  <div className="screen-link-btn pulse-1"></div>
                  <div className="screen-link-btn pulse-2"></div>
                  <div className="screen-link-btn pulse-3"></div>
                </div>
                <div className="screen-msg-preview">
                  <div className="msg-dot"></div>
                  <div className="msg-lines">
                    <div className="msg-line long"></div>
                    <div className="msg-line short"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-card card-msg">
              <span>💬</span> New anonymous message
            </div>
            <div className="floating-card card-fan">
              <span>⭐</span> Fan message received
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="features-container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2>Everything you need to connect</h2>
            <p>Built for creators who want more than just a link page.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card feature-highlight">
              <div className="feature-icon-wrap">
                <div className="feature-icon">💬</div>
              </div>
              <h3>Anonymous Messages</h3>
              <p>Let your audience send you messages without revealing their identity. Perfect for honest feedback and fun Q&As.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">
                <div className="feature-icon">⭐</div>
              </div>
              <h3>Fan Chat</h3>
              <p>Accept fan messages and start real-time conversations with a unique session token system.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">
                <div className="feature-icon">🎨</div>
              </div>
              <h3>Custom Themes</h3>
              <p>Choose from 5 color themes and dark mode to match your personal brand and style.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">
                <div className="feature-icon">🔗</div>
              </div>
              <h3>One Shareable Link</h3>
              <p>Share your unique profile link anywhere — Instagram, Twitter, TikTok, or your email signature.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">
                <div className="feature-icon">📱</div>
              </div>
              <h3>Mobile Optimized</h3>
              <p>Every pixel is crafted for mobile. Your audience gets a flawless experience on any device.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">
                <div className="feature-icon">🔒</div>
              </div>
              <h3>Secure & Private</h3>
              <p>Built on Firebase with end-to-end security. You control what stays and what gets deleted.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="how-container">
          <div className="section-header light">
            <span className="section-tag">How it works</span>
            <h2>Live in 4 steps</h2>
            <p>From zero to your own bio link in under 2 minutes.</p>
          </div>
          <div className="steps-track">
            <div className="steps-line"></div>
            <div className="step-card">
              <div className="step-num">1</div>
              <div className="step-body">
                <h3>Create Account</h3>
                <p>Sign up with email or Google — takes 10 seconds.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <div className="step-body">
                <h3>Claim Your Username</h3>
                <p>Pick a unique handle like @yourname — it's yours forever.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <div className="step-body">
                <h3>Customize Profile</h3>
                <p>Add your photo, bio, and pick a theme that fits your vibe.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-num">4</div>
              <div className="step-body">
                <h3>Share & Receive</h3>
                <p>Drop your link anywhere and start receiving messages instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-card">
            <h2>Ready to connect with your audience?</h2>
            <p>Join creators who are building real connections — for free.</p>
            <button className="btn-cta" onClick={() => navigate('/login')}>
              Create your BioLink
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <img src={logo} alt="BioLink" className="footer-logo" />
            <span>BioLink</span>
          </div>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#contact">Contact</a>
          </div>
          <p className="footer-copy">&copy; 2026 BioLink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
