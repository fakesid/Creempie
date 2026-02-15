# 🚀 Setup Guide for Bio Link Share App

Hello! Let's get your app running. Follow these steps carefully:

## Step 1: Create Firebase Project ✅

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a new project"**
3. Name it: `bio-link-share`
4. Click **"Create project"**
5. Wait for it to finish (2-3 minutes)

## Step 2: Enable Google Authentication

1. In Firebase Console, click on your project
2. Go to **"Build"** → **"Authentication"**
3. Click **"Get started"** (if you see it)
4. Click **"Sign-in method"** tab
5. Click **"Google"**
6. Toggle **"Enable"** to ON
7. Select a support email
8. Click **"Save"**

## Step 3: Enable Email/Password Authentication

1. In **"Sign-in method"** tab
2. Click **"Email/Password"**
3. Toggle **"Enable"** to ON
4. Click **"Save"**

## Step 4: Create Firestore Database

1. Go to **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select your region (e.g., **"United States"**)
5. Click **"Create"**
6. Wait for it to initialize

## Step 5: Get Your Firebase Config

1. Go to **"Project Settings"** (click gear icon ⚙️)
2. Scroll down to **"Your apps"**
3. If no app exists, click **"Web"** (looks like `</>`)
4. Give it a name like `bio-link-share`
5. Click **"Register app"**
6. Copy the config object that appears
7. It looks like this:

```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "bio-link-share",
  storageBucket: "bio-link-share.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
}
```

## Step 6: Update Your App Config

1. Open the project in VS Code
2. Find the file: `src/firebase/config.js`
3. Replace the values in `firebaseConfig` object with your copied values
4. **Save the file** (Ctrl+S or Cmd+S)

## Step 7: Run the App

In terminal, run:

```bash
npm start
```

The app will open at http://localhost:3000

## Step 8: Create Your Username

On first login, you'll see a **Setup Username** page:

1. Enter a unique username (minimum 3 characters)
   - Can use letters, numbers, and underscores
   - Will be used for your profile link: `/profile/yourname`
2. Check availability (live checking shows if taken)
3. Click **"Set Username"**
4. You'll be redirected to your Dashboard

## Step 9: Test the App

1. On Dashboard, see your **Profile Link** like:
   ```
   http://localhost:3000/profile/yourname
   ```
2. Click **"Copy Link"** button
3. Open the link in a new tab (or private window)
4. You should see your **Public Profile** with:
   - Your profile picture
   - Your name
   - A form to send messages
5. Choose message type:
   - **🔒 Anonymous** - Private message (anyone can send)
   - **⭐ Fan** - Special fan message (future: requires tokens)
6. Type a test message and click **"Send Message"**
7. Go back to dashboard - see your message in the **Messages** section!
8. Click on the **Anonymous** or **Fan** tabs to filter messages by type

## 🎉 Success!

If you see your dashboard and can send/receive messages, everything works!

## 🐛 Troubleshooting

### Issue: "Firebase config is not initialized"
- Make sure you updated `src/firebase/config.js`
- Check that all values are copied correctly
- No extra quotes or spaces

### Issue: "Email already exists"
- That email is already registered
- Use a different email to sign up

### Issue: Messages not appearing
- Make sure you're signed in
- Copy the profile link from dashboard
- Open it in a new browser tab (not same tab)

### Issue: Google sign-in not working
- In Firebase Console, check if you added your localhost to authorized redirect URIs
- The URI should be: `http://localhost:3000/`

## 📚 What Each File Does

```
src/
├── firebase/config.js      - Firebase connection (UPDATE THIS!)
├── pages/
│   ├── Login.js            - Sign up & login page
│   ├── SetupUsername.js    - Username creation (first-time setup)
│   ├── Dashboard.js        - Your inbox & profile link
│   └── ProfileShare.js     - Public profile page (by username)
├── App.js                  - Main app logic & routing
└── styles (*.css)          - Page styling
```

## 🎯 Next Steps

Once it's working:

1. ✅ Sign up with email or Google
2. ✅ Set up your unique username
3. ✅ Copy your profile link
4. ✅ Share your profile link on social media/bios
5. ✅ Send test messages (both anonymous and fan types)
6. ✅ View messages in inbox with filtering by type

## 🚀 Deploy to the Internet (Later)

When you're ready to share with real people:
- **Vercel** (recommended for beginners) - Super easy!
- **Firebase Hosting** - Also easy

## 💬 Need Help?

If you get stuck:
1. Read the error message carefully
2. Check the troubleshooting section above
3. Look at the Firebase Console for errors

---

**You've got this! Good luck! 🎉**
