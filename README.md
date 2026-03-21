# Returnify 🔍
### Campus Lost & Found — DKTE College

A real-time web application where DKTE students can post lost or found items, contact each other, and publicly track who reported and who claimed each item.

---

## 🌐 Live Demo
> Add your deployed link here after hosting

---

## 📸 Screenshots
> Add screenshots after deployment

---

## ✨ Features

- 🔐 **Google Sign-In** — restricted to `@dkte.ac.in` email IDs only
- 📢 **Report Lost / Found items** — with title, category, description, location
- 👤 **Reporter visibility** — every card publicly shows who reported the item
- ✅ **Claim system** — any student can claim a lost item; claimant name & email shown publicly
- 🔴 **Real-time updates** — new items appear instantly without page refresh (Firebase `onSnapshot`)
- 🔎 **Search & Filter** — filter by Lost / Found / Category / Claimed, search by keyword
- 🗑️ **Delete your own posts** — only the original poster can delete
- 📧 **Contact poster** — one-click mailto link to reach the reporter
- 📱 **Fully responsive** — works on mobile and desktop

---

## 🗂️ Project Structure

```
returnify/
├── index.html          ← Page structure (HTML only, no inline CSS/JS)
├── README.md           ← You are here
├── css/
│   ├── base.css        ← CSS variables, reset, typography
│   ├── components.css  ← Buttons, cards, badges, modals, toast
│   └── layout.css      ← Navbar, hero, grid, filters, responsive
└── js/
    └── firebase.js     ← All Firebase logic (auth, Firestore, render)
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling (separated into 3 files) |
| JavaScript (ES6+) | App logic |
| Firebase Firestore | Real-time NoSQL database |
| Firebase Auth | Google OAuth sign-in |
| Firebase Hosting | Deployment |
| Git & GitHub | Version control |

---

## ⚙️ Setup & Installation

### Prerequisites
- VS Code with **Live Server** extension installed
- A Google account (for Firebase)
- Git installed

### Step 1 — Clone the repository
```bash
git clone https://github.com/anonSoham/returnify.git
cd returnify
```

### Step 2 — Create a Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `returnify` → disable Analytics → **Create project**

### Step 3 — Enable Firestore
1. Left sidebar → **Build** → **Firestore Database** → **Create database**
2. Choose **Start in test mode** → region: **asia-south1 (Mumbai)** → **Enable**

### Step 4 — Enable Google Auth
1. Left sidebar → **Build** → **Authentication** → **Get started**
2. **Sign-in method** tab → **Google** → toggle **Enable** → add support email → **Save**

### Step 5 — Add authorized domains
1. Authentication → **Settings** tab → **Authorized domains**
2. Click **Add domain** → add `127.0.0.1` (for local dev)
3. After deployment, also add your live domain here

### Step 6 — Get Firebase config
1. Project Settings (gear icon) → **General** → **Your apps** → click `</>` Web icon
2. Register app as `returnify-web` → copy the `firebaseConfig` object

### Step 7 — Paste config into the project
Open `js/firebase.js` and replace the config block:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

### Step 8 — Run locally
1. Open the project folder in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. Visit `http://127.0.0.1:5500`

> ⚠️ Do NOT open `index.html` by double-clicking — Firebase modules require `http://`, not `file://`

---

## 🚀 Deployment (Firebase Hosting)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting in project folder
firebase init hosting
# → Use existing project: returnify
# → Public directory: . (just a dot)
# → Single page app: No
# → Overwrite index.html: No

# Deploy
firebase deploy
```



---

## 🔒 Security

- Only `@dkte.ac.in` email addresses can sign in — enforced on both frontend and Firebase Auth
- Firestore rules restrict delete to the item's original poster only
- Domain restriction runs on every auth state change — cannot be bypassed

### Firestore Rules
Go to Firestore → **Rules** tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{item} {
      allow read:   if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null
                    && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 📤 Push to GitHub

```bash
cd returnify
git init
git add .
git commit -m "feat: Returnify - campus lost and found app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/returnify.git
git push -u origin main
```

---

## 🗃️ Database Schema

Each document in the `items` Firestore collection:

| Field | Type | Description |
|---|---|---|
| `title` | string | Item name |
| `type` | string | `"Lost"` or `"Found"` |
| `category` | string | Electronics, Books, Keys, etc. |
| `desc` | string | Description / identifying details |
| `location` | string | Where it was lost/found |
| `email` | string | Reporter's contact email |
| `status` | string | `"active"` or `"claimed"` |
| `userId` | string | Firebase UID of reporter |
| `userName` | string | Display name of reporter |
| `createdAt` | timestamp | When item was posted |
| `claimedById` | string | Firebase UID of claimant |
| `claimedByName` | string | Display name of claimant |
| `claimedByEmail` | string | Email of claimant |
| `claimedAt` | timestamp | When item was claimed |

---

## 👨‍💻 Built By

**Soham Bhogale**
Web Development Intern — TecSpeak IT solutions
DKTE College, Ichalkaranji

---

## 📄 License

This project is built for educational purposes as part of a web development internship.
