// ============================================
//  firebase.js — Firebase init, auth, DB logic
//  Returnify | DKTE College
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, deleteDoc,
  doc, updateDoc, query, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, signInWithPopup, GoogleAuthProvider,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// =============================================
// REPLACE WITH YOUR FIREBASE CONFIG
// Go to: https://console.firebase.google.com
// Create project → Web app → Copy config here
// =============================================
const firebaseConfig = {
  apiKey:            "AIzaSyC0GggkzjK0_eVfsmXXE1RAsd-r6fZfDq4",
  authDomain:        "returnify-99.firebaseapp.com",
  projectId:         "returnify-99",
  storageBucket:     "returnify-99.firebasestorage.app",
  messagingSenderId: "533905837616",
  appId:             "1:533905837616:web:a3aad252d18d32f7dfa7f5"
};

// --- Init ---
const app      = initializeApp(firebaseConfig);
const db       = getFirestore(app);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

// --- State ---
let currentUser  = null;
let allItems     = [];
let activeFilter = 'All';

// --- Domain restriction ---
const ALLOWED_DOMAIN = 'dkte.ac.in';
const isDKTE = (email) => email && email.toLowerCase().endsWith('@' + ALLOWED_DOMAIN);

// ============================================
//  AUTH
// ============================================

window.handleAuth = async () => {
  if (currentUser) {
    await signOut(auth);
  } else {
    try {
      const result = await signInWithPopup(auth, provider);
      if (!isDKTE(result.user.email)) {
        await signOut(auth);
        showToast('Access restricted to @dkte.ac.in email IDs only.');
      }
    } catch (e) {
      showToast('Sign-in failed: ' + e.message);
    }
  }
};

onAuthStateChanged(auth, (user) => {
  if (user && !isDKTE(user.email)) {
    signOut(auth);
    showToast('Access restricted to @dkte.ac.in email IDs only.');
    return;
  }

  currentUser = user;
  const btn  = document.getElementById('auth-btn');
  const info = document.getElementById('user-info');

  if (user) {
    btn.textContent               = 'Sign Out';
    info.style.display            = 'flex';
    document.getElementById('user-name').textContent   = user.displayName?.split(' ')[0] || 'User';
    document.getElementById('user-avatar').src         = user.photoURL || '';
  } else {
    btn.textContent    = 'Sign in with Google';
    info.style.display = 'none';
  }

  renderItems();
});

// ============================================
//  REALTIME LISTENER
// ============================================

const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
onSnapshot(q, (snap) => {
  allItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderItems();
});

// ============================================
//  MODAL CONTROLS
// ============================================

window.openModal = (type) => {
  if (!currentUser) { showToast('Please sign in to post an item'); return; }
  document.getElementById('f-type').value = type;
  document.getElementById('modal-title').textContent =
    type === 'Lost' ? '🚩 Report Lost Item' : '🟢 Report Found Item';
  document.getElementById('modal').classList.add('show');
};

window.closeModal = () => {
  document.getElementById('modal').classList.remove('show');
};

// ============================================
//  POST ITEM
// ============================================

window.submitItem = async () => {
  const title = document.getElementById('f-title').value.trim();
  const desc  = document.getElementById('f-desc').value.trim();
  const loc   = document.getElementById('f-loc').value.trim();
  const email = document.getElementById('f-email').value.trim();

  if (!title || !loc || !email) {
    showToast('Please fill in all required fields');
    return;
  }

  try {
    await addDoc(collection(db, 'items'), {
      type:      document.getElementById('f-type').value,
      title,
      category:  document.getElementById('f-cat').value,
      desc,
      location:  loc,
      email,
      status:    'active',
      userId:    currentUser.uid,
      userName:  currentUser.displayName,
      createdAt: serverTimestamp()
    });

    closeModal();
    ['f-title', 'f-desc', 'f-loc', 'f-email'].forEach(id => {
      document.getElementById(id).value = '';
    });
    showToast('Item posted successfully!');
  } catch (e) {
    showToast('Error: ' + e.message);
  }
};

// ============================================
//  CLAIM ITEM
// ============================================

window.claimItem = async (id) => {
  if (!currentUser) { showToast('Please sign in to claim an item'); return; }
  if (!confirm('Confirm: You are claiming this item as yours?')) return;

  try {
    await updateDoc(doc(db, 'items', id), {
      status:         'claimed',
      claimedById:    currentUser.uid,
      claimedByName:  currentUser.displayName || currentUser.email.split('@')[0],
      claimedByEmail: currentUser.email,
      claimedAt:      serverTimestamp()
    });
    showToast('Item marked as claimed!');
  } catch (e) {
    showToast('Error: ' + e.message);
  }
};

// ============================================
//  DELETE ITEM
// ============================================

window.deleteItem = async (id) => {
  if (!confirm('Delete this item?')) return;
  try {
    await deleteDoc(doc(db, 'items', id));
    showToast('Item deleted');
  } catch (e) {
    showToast('Error: ' + e.message);
  }
};

// ============================================
//  FILTER
// ============================================

window.setFilter = (filter, el) => {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderItems();
};

// ============================================
//  RENDER ITEMS
// ============================================

window.renderItems = () => {
  const grid   = document.getElementById('items-grid');
  const search = document.getElementById('search-input')?.value.toLowerCase() || '';
  let items    = [...allItems];

  if (activeFilter === 'Claimed') {
    items = items.filter(i => i.status === 'claimed');
  } else if (activeFilter !== 'All') {
    items = items.filter(i => i.type === activeFilter || i.category === activeFilter);
  }

  if (search) {
    items = items.filter(i =>
      i.title?.toLowerCase().includes(search) ||
      i.desc?.toLowerCase().includes(search)  ||
      i.location?.toLowerCase().includes(search)
    );
  }

  if (!items.length) {
    grid.innerHTML = `<div class="empty"><div>🔍</div><p>No items found. Be the first to post!</p></div>`;
    return;
  }

  const catEmoji = {
    Electronics: '📱', Books: '📚', Clothing: '👔',
    Keys: '🔑', 'ID / Cards': '📄', 'Bag / Wallet': '👜', Other: '📦'
  };

  grid.innerHTML = items.map(item => buildCard(item, catEmoji)).join('');
};

// ============================================
//  BUILD CARD HTML
// ============================================

function buildCard(item, catEmoji) {
  const date = item.createdAt?.toDate
    ? item.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : 'Just now';

  const isClaimed  = item.status === 'claimed';
  const isOwner    = currentUser && currentUser.uid === item.userId;
  const canClaim   = currentUser && !isOwner && !isClaimed && item.type === 'Lost';
  const emoji      = catEmoji[item.category] || '📦';

  const initials        = getInitials(item.userName);
  const claimedInitials = getInitials(item.claimedByName);
  const claimedDate     = item.claimedAt?.toDate
    ? item.claimedAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';

  const badgeClass = isClaimed ? 'badge-claimed' : `badge-${item.type.toLowerCase()}`;
  const badgeLabel = isClaimed ? '✅ Claimed' : item.type;

  return `
    <div class="item-card ${isClaimed ? 'card-claimed' : ''}">
      <div class="card-img">${emoji}</div>
      <div class="card-body">

        <div class="card-meta">
          <span class="badge ${badgeClass}">${badgeLabel}</span>
          <span class="cat-tag">${item.category}</span>
        </div>

        <div class="card-title">${item.title}</div>
        <div class="card-desc">${item.desc || 'No description provided.'}</div>

        <div class="reporter-row">
          <div class="reporter-avatar">${initials}</div>
          <div>
            <div class="reporter-label">Reported by</div>
            <div class="reporter-name">
              ${item.userName || 'Anonymous'}
              <span style="font-weight:400; color:var(--muted); font-size:11px">${item.email}</span>
            </div>
          </div>
        </div>

        ${isClaimed ? `
        <div class="claimed-banner">
          <div class="claimed-banner-title">✅ Item Claimed</div>
          <div style="display:flex; align-items:center; gap:6px">
            <div class="reporter-avatar" style="background:#2e7d32">${claimedInitials}</div>
            <div>
              <div class="claimed-banner-name">${item.claimedByName || 'Unknown'}</div>
              <div class="claimed-banner-time">${item.claimedByEmail || ''} · ${claimedDate}</div>
            </div>
          </div>
        </div>` : ''}

        <div class="card-footer">
          <span class="card-loc">📍 ${item.location}</span>
          <div style="display:flex; align-items:center; gap:6px">
            <span class="card-date">${date}</span>
            ${canClaim   ? `<button class="claim-btn"   onclick="claimItem('${item.id}')">🛒 Claim</button>` : ''}
            ${!isClaimed ? `<a class="contact-btn" href="mailto:${item.email}?subject=Re: ${item.title}">Contact</a>` : ''}
            ${isOwner    ? `<button class="delete-btn"  onclick="deleteItem('${item.id}')">🗑</button>` : ''}
          </div>
        </div>

      </div>
    </div>`;
}

// ============================================
//  HELPERS
// ============================================

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

window.showToast = (msg) => {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
};