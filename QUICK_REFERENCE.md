# 🔍 Quick Reference Guide

Keep this handy while coding!

---

## 🚀 Quick Commands

```bash
# Start development server
npm start

# Stop the server
Ctrl+C (or Cmd+C on Mac)

# Reinstall dependencies (if broken)
rm -rf node_modules
npm install

# Check for errors
npm run build
```

---

## 📍 File Locations

| What | Where |
|------|-------|
| Firebase config | `src/firebase/config.js` |
| Login page | `src/pages/Login.js` |
| Username setup | `src/pages/SetupUsername.js` |
| Dashboard page | `src/pages/Dashboard.js` |
| Profile page | `src/pages/ProfileShare.js` |
| Main app file | `src/App.js` |

---

## 🔐 Firebase Config Checklist

Before running the app, make sure:

- [ ] Go to Firebase Console
- [ ] Copy your web config
- [ ] Paste into `src/firebase/config.js`
- [ ] Replace these 6 fields:
  ```
  apiKey
  authDomain
  projectId
  storageBucket
  messagingSenderId
  appId
  ```

---

## 📊 Firestore Collections

### Users Collection (`users/{userId}`)
```
{
  uid: "abc123",
  email: "user@gmail.com",
  displayName: "John",
  photoURL: "https://...",  // Only for Google users
  bio: "",
  username: "john_doe",      // UNIQUE! Used in /profile/username URLs
  createdAt: timestamp
}
```

### Messages Collection (`messages/{messageId}`)
```
{
  receiverId: "abc123",           // Who gets the message
  content: "Hello!",
  messageType: "anonymous",       // 'anonymous' or 'fan'
  createdAt: timestamp,
  isRead: false
}
```

**Message Types:**
- `"anonymous"` - 🔒 Private message, can be sent by anyone
- `"fan"` - ⭐ Special fan message (future: may require tokens)

---

## 🎨 Color Scheme

**Primary Color:** `#667eea` (Purple/Blue)
**Secondary Color:** `#764ba2` (Dark Purple)
**Success Color:** `#28a745` (Green)
**Error Color:** `#dc3545` (Red)

**Where to change:**
- Login form: `src/pages/Login.css`
- Dashboard: `src/pages/Dashboard.css`
- Profile: `src/pages/ProfileShare.css`

---

## 🔗 Key URLs

When running locally:
- App: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Setup Username: `http://localhost:3000/setup-username`
- Dashboard: `http://localhost:3000/dashboard`
- Example profile: `http://localhost:3000/profile/yourname`
- Another profile: `http://localhost:3000/profile/john_doe`

**Note:** Profile URLs use usernames (not user IDs), making them easy to share!

---

## 📱 Responsive Breakpoints

```css
/* Mobile: Up to 600px */
@media (max-width: 600px) {
  /* Mobile styles */
}

/* Tablet: Up to 768px */
@media (max-width: 768px) {
  /* Tablet styles */
}
```

---

## 🧩 Component Structure

```
App.js
├── Login.js (public)
│   ├── Email signup/login form
│   └── Google auth button
│
├── SetupUsername.js (first-time only)
│   ├── Username input
│   ├── Availability checker
│   └── Set button
│
├── Dashboard.js (only for authenticated users with username)
│   ├── Profile link display
│   ├── Copy button
│   ├── Message tabs (All/Anonymous/Fan)
│   ├── Message count badges
│   └── Filtered messages list
│
└── ProfileShare.js (public, no authentication)
    ├── User profile display
    ├── Profile statistics
    ├── Message type selector (Anonymous/Fan)
    ├── Message info display
    └── Message form
```

---

## 🔄 Data Flow Diagram

```
SIGN UP
  User enters email & password
        ↓
  Firebase creates account
        ↓
  App creates user profile in Firestore
        ↓
  Redirect to Dashboard

LOGIN
  User enters credentials
        ↓
  Firebase validates
        ↓
  Redirect to Dashboard

VIEW PROFILE
  Visit link (no login needed)
        ↓
  Fetch user from Firestore
        ↓
  Show profile + message form

SEND MESSAGE
  Fill message form
        ↓
  Click Send
        ↓
  Save to Firestore messages collection
        ↓
  Real-time update in Dashboard ✨

DELETE MESSAGE
  Click delete button
        ↓
  Remove from Firestore
        ↓
  Dashboard updates instantly
```

---

## 🎯 Key Code Locations

| Feature | File | Line Range (approx) |
|---------|------|-------------------|
| Email signup | `Login.js` | 30-50 |
| Google signin | `Login.js` | 60-80 |
| Create user profile | `Login.js` | 40-45 |
| Display dashboard | `Dashboard.js` | 40-60 |
| Copy profile link | `Dashboard.js` | 100-105 |
| Fetch messages | `Dashboard.js` | 20-35 |
| Send message | `ProfileShare.js` | 55-75 |
| Delete message | `Dashboard.js` | 115-120 |

---

## 🐛 Common Error Messages

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| "Firebase is not configured" | Missing Firebase config | Update `src/firebase/config.js` |
| "User already exists" | Email already registered | Use different email |
| "User not found" | Invalid email/password | Check credentials |
| "Messages not appearing" | Testing in same tab | Use new tab/incognito |
| "CORS error" | Firebase config issue | Check apiKey value |

---

## ✅ Testing Checklist

Quick checklist to test your app:

```
[ ] Can sign up with email
[ ] Can login with email
[ ] Can sign up with Google
[ ] Dashboard shows profile link
[ ] Copy button works
[ ] Profile link opens in browser
[ ] Can send message on public profile
[ ] Message appears in dashboard
[ ] Real-time update works (no refresh needed)
[ ] Can delete message
[ ] After logout, need to login again
[ ] After refresh, still logged in
```

---

## 🎨 Customization Quick Edits

### Change App Title
Edit `public/index.html`:
```html
<title>Your App Name Here</title>
```

### Change Welcome Message
Edit `src/pages/Dashboard.js`:
```javascript
<h1>Welcome Title Here</h1>
```

### Change Profile Message Placeholder
Edit `src/pages/ProfileShare.js`:
```javascript
placeholder="Your text here..."
```

### Change Colors
Find hex colors in CSS files:
- `#667eea` (main color)
- `#764ba2` (secondary)

Replace with your colors.

---

## 📦 Dependency Reference

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.2.0 | UI framework |
| react-dom | 18.2.0 | React rendering |
| react-router-dom | 6.22.0 | Page navigation |
| firebase | 10.7.0 | Backend services |
| axios | 1.6.5 | HTTP requests (if needed) |
| react-scripts | 5.0.1 | Build tools |

---

## 🔑 Important Variables

| Variable | What It Stores |
|----------|----------------|
| `user` | Current logged-in user object |
| `messages` | Array of received messages |
| `profileLink` | User's shareable profile URL |
| `loading` | Whether data is still loading |
| `error` | Error message (if any) |

---

## 🚀 Deployment Checklist

When ready to go live:

```
[ ] Firebase config updated with your values
[ ] All features tested locally
[ ] No console errors
[ ] Firebase Firestore rules are set to production
[ ] Google OAuth authorized domain added
[ ] Build passes: npm run build
[ ] Ready to deploy to Vercel or Firebase Hosting
```

---

## 📚 File Size Reference

| File | Size | Complexity |
|------|------|-----------|
| Login.js | ~330 lines | Medium |
| Dashboard.js | ~140 lines | Medium |
| ProfileShare.js | ~120 lines | Easy |
| App.js | ~50 lines | Easy |
| Styles (*.css) | ~400 lines total | Easy |

---

## 🎓 Learning Resources Quick Links

| Topic | Resource |
|-------|----------|
| React | [react.dev](https://react.dev) |
| Firebase | [firebase.google.com/docs](https://firebase.google.com/docs) |
| JavaScript | [developer.mozilla.org](https://developer.mozilla.org) |
| CSS | [css-tricks.com](https://css-tricks.com) |

---

## 💬 Code Comments Format

In your code, comments look like:
```javascript
// This is a single line comment
/* This is a multi-line
   comment block */
```

Read them - they explain what the code does!

---

## ⚡ Performance Tips

- ✅ Don't create too many messages (real-time updates slow down)
- ✅ Consider pagination for very long message lists later
- ✅ Firebase free tier is great for testing
- ✅ Real-time listeners are powerful but use bandwidth

---

## 🆘 Emergency Fixes

### App won't start
```bash
npm cache clean --force
rm -rf node_modules
npm install
npm start
```

### React error
- Check browser console (F12)
- Look for red error messages
- Read the error carefully

### Firebase error
- Check Firebase console
- Make sure Firestore database exists
- Check that collections are created

### Messages not saving
- Refresh the page
- Check browser console for errors
- Check Firestore database in Firebase console

---

## ✨ Pro Tips

1. **F12 / Cmd+Opt+I** - Open browser dev tools (super useful!)
2. **Console tab** - See error messages here
3. **Network tab** - See Firebase requests
4. **Elements tab** - Inspect HTML/CSS
5. **Ctrl+Z** - Undo code changes

---

## 🎯 Next Actions

1. Update Firebase config
2. Run `npm start`
3. Open DevTools (F12)
4. Test in Console tab
5. Check Network tab for Firebase calls

---

**Bookmark this page! You'll reference it often.** 📌
