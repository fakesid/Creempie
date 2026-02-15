# Bio Link Share - Anonymous Messaging App

A modern web app where users can create profiles and receive anonymous messages through shareable bio links.

## 🌟 Features

- **Google OAuth & Email Authentication** - Sign up/login with Google or email
- **Unique Username System** - Create custom usernames for memorable profile URLs
- **Shareable Bio Links** - Get a unique link to share on your social media bio
- **Beautiful Profile Landing Page** - Hero section with profile stats and visual appeal
- **Multiple Message Types** - Send anonymous or fan messages
- **Profile Statistics** - See total messages, fan count, and fan rate percentage
- **Fan Badge** - Golden star badge on profiles with fans
- **Message Inbox** - View and manage messages with tabbed filtering
- **Message Filtering** - Filter between All, Anonymous, and Fan messages
- **Real-time Updates** - Messages appear instantly in your inbox
- **User-friendly UI** - Beautiful, responsive design with smooth animations

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Firebase (Firestore + Authentication)
- **Styling**: CSS3
- **Routing**: React Router v6

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account (free tier available)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Name it "bio-link-share"
4. Click "Create project"

### 3. Set Up Firebase Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Enable **Email/Password** provider

### 4. Set Up Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (for development)
3. Select **US** region (or your preferred location)

### 5. Create `.env.local` File

In your project root, create a file named `.env.local`:

```
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
```

Replace the values with your Firebase config:
- Go to Firebase Console → Project Settings
- Scroll to "Your apps" section
- Click Web app icon (looks like `</>`)
- Copy the firebaseConfig object and fill in above values

Edit `src/firebase/config.js` and replace the firebaseConfig with your actual values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Read [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed step-by-step Firebase configuration instructions.

### 7. Start Development Server

```bash
npm start
```

Your app will open at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/        # Reusable React components
├── pages/           # Page components
│   ├── Login.js       # Authentication page
│   ├── Dashboard.js   # User inbox & profile link
│   └── ProfileShare.js # Public profile & message form
├── firebase/
│   └── config.js     # Firebase configuration
├── App.js            # Main app component
└── index.js          # React entry point
```

## 🔐 Firestore Database Schema

### Users Collection
```
users/{userId}
├── uid: string
├── email: string
├── displayName: string
├── photoURL: string (optional)
├── bio: string
└── createdAt: timestamp
```

### Messages Collection
```
messages/{messageId}
├── receiverId: string
├── content: string
├── createdAt: timestamp
└── isRead: boolean
```

## 🎯 How It Works

1. **User Signs Up** → Creates profile in Firestore
2. **Gets Profile Link** → Unique URL like `yoursite.com/profile/{userId}`
3. **Shares Link** → Can share on Instagram, Twitter, etc.
4. **Visits Get Profile** → Sees user's profile (photo, name, bio)
5. **Visitors Send Messages** → Anonymous messages saved to Firestore
6. **User Sees Messages** → All messages appear in their dashboard inbox

## 🔧 Customization Tips for Beginners

### Change Colors
Edit the gradient color in `src/pages/Login.css` and `src/pages/ProfileShare.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add More User Fields
Edit `src/firebase/config.js` to add more fields when creating user profile

### Modify Message Limit
Edit `src/pages/ProfileShare.js` line with `maxLength="500"` to change message character limit

### Add User Bio Edit Feature
Additional tutorial: Create a settings page where users can edit their bio

## 📱 Features You Can Add Later

- [ ] User profile edit page
- [ ] Like/react to messages
- [ ] Message categories/tags
- [ ] Dark mode
- [ ] Search users
- [ ] Message scheduling
- [ ] User statistics dashboard

## 🐛 Common Issues

### Messages not appearing?
- Check Firestore rules (should be in test mode)
- Make sure `receiverId` matches the userId in the URL

### Firebase config not working?
- Double-check all copied values
- Make sure no extra spaces or quotes

### Google sign-in not working?
- Verify OAuth redirect URI in Firebase Console matches your localhost

## 📚 Learning Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [React Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)

## 🚀 Deployment

### Deploy to Vercel (Recommended for beginners)
1. Push code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
npm run build
firebase init hosting
firebase deploy
```

## 📝 License

This project is open source and available for learning purposes.

## 🤝 Need Help?

Message me with specific errors or questions!

---

**Happy coding! 🎉**
