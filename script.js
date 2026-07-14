// ============================================================
//  Firebase Configuration & Initialization
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  remove,
  update,
  onValue,
  query,
  orderByChild,
  limitToLast
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDveNGDQz7sXrHtAo6CEq5pnWEkhzb5fWE",
  authDomain: "game-z-dd5de.firebaseapp.com",
  databaseURL: "https://game-z-dd5de-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "game-z-dd5de",
  storageBucket: "game-z-dd5de.firebasestorage.app",
  messagingSenderId: "579411685421",
  appId: "1:579411685421:web:6db829e8046a34c72f48a4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ============================================================
//  FIREBASE CRUD FUNCTIONS
// ============================================================

// ----- دریافت سرورها -----
async function getServers() {
  try {
    const snapshot = await get(ref(db, 'servers'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    // داده‌های پیش‌فرض
    const defaultServers = [
      { name: '🏰 DragonCraft', region: 'ایران', version: '1.20.4', ip: 'play.dragoncraft.ir', players: '150', rating: '4.8', game: 'ماینکرفت', status: '🟢 آنلاین', ping: '70ms', likes: 456, votes: 1234, wipe: 'هر ۷ روز', createdAt: new Date().toISOString() },
      { name: '⚔️ SkyWars IR', region: 'ایران', version: '1.19.2', ip: 'skywars.ir', players: '200', rating: '4.7', game: 'ماینکرفت', status: '🟢 آنلاین', ping: '65ms', likes: 320, votes: 980, wipe: 'هر ۱۰ روز', createdAt: new Date().toISOString() },
      { name: '🔫 Persian CS2', region: 'ایران', version: 'CS2', ip: 'cs2.persian.ir', players: '100', rating: '4.9', game: 'CS2', status: '🟢 آنلاین', ping: '60ms', likes: 280, votes: 750, wipe: 'همیشه', createdAt: new Date().toISOString() },
      { name: '💥 IRAN CS 1.6', region: 'ایران', version: '1.6', ip: 'cs16.iran.ir', players: '80', rating: '4.6', game: 'CS 1.6', status: '🟢 آنلاین', ping: '75ms', likes: 190, votes: 540, wipe: 'همیشه', createdAt: new Date().toISOString() },
      { name: '🛡️ Rust Iran', region: 'ایران', version: 'Rust', ip: 'rust.iran.ir', players: '60', rating: '4.5', game: 'Rust', status: '🟢 آنلاین', ping: '80ms', likes: 120, votes: 320, wipe: 'هر ۳۰ روز', createdAt: new Date().toISOString() }
    ];
    
    // ذخیره داده‌های پیش‌فرض در Firebase
    for (const server of defaultServers) {
      const newRef = push(ref(db, 'servers'));
      await set(newRef, server);
    }
    return defaultServers;
  } catch (error) {
    console.error('❌ خطا در دریافت سرورها:', error);
    return [];
  }
}

// ----- افزودن سرور جدید -----
async function addServerFirebase(serverData) {
  try {
    const newRef = push(ref(db, 'servers'));
    await set(newRef, serverData);
    return newRef.key;
  } catch (error) {
    console.error('❌ خطا در افزودن سرور:', error);
    return null;
  }
}

// ----- حذف سرور -----
async function deleteServerFirebase(id) {
  try {
    await remove(ref(db, `servers/${id}`));
    return true;
  } catch (error) {
    console.error('❌ خطا در حذف سرور:', error);
    return false;
  }
}

// ----- ویرایش سرور -----
async function updateServerFirebase(id, data) {
  try {
    await update(ref(db, `servers/${id}`), data);
    return true;
  } catch (error) {
    console.error('❌ خطا در ویرایش سرور:', error);
    return false;
  }
}

// ----- دریافت نظرات -----
async function getComments() {
  try {
    const snapshot = await get(ref(db, 'comments'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    // نظرات پیش‌فرض
    const defaultComments = [
      { user: 'Arsha_pm', text: '🔥 بهترین سرور ماینکرفت ایران! پینگ عالی و جامعه فعال', server: 'DragonCraft', serverId: '1', date: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'), status: 'approved' },
      { user: 'Reza_Gamer', text: 'منتظر وایپ بعدی هستم، سرور عالیه 👌', server: 'SkyWars IR', serverId: '2', date: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'), status: 'approved' },
      { user: 'Ali_Pro', text: 'دوست دارم این سرور، ادمین‌ها خیلی فعالن', server: 'Persian CS2', serverId: '3', date: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'), status: 'approved' }
    ];
    
    for (const comment of defaultComments) {
      const newRef = push(ref(db, 'comments'));
      await set(newRef, comment);
    }
    return defaultComments;
  } catch (error) {
    console.error('❌ خطا در دریافت نظرات:', error);
    return [];
  }
}

// ----- افزودن نظر جدید -----
async function addCommentFirebase(commentData) {
  try {
    const newRef = push(ref(db, 'comments'));
    await set(newRef, commentData);
    return newRef.key;
  } catch (error) {
    console.error('❌ خطا در افزودن نظر:', error);
    return null;
  }
}

// ----- تایید نظر -----
async function approveCommentFirebase(id) {
  try {
    await update(ref(db, `comments/${id}`), { status: 'approved' });
    return true;
  } catch (error) {
    console.error('❌ خطا در تایید نظر:', error);
    return false;
  }
}

// ----- رد نظر -----
async function rejectCommentFirebase(id) {
  try {
    await remove(ref(db, `comments/${id}`));
    return true;
  } catch (error) {
    console.error('❌ خطا در رد نظر:', error);
    return false;
  }
}

// ----- حذف نظر -----
async function deleteCommentFirebase(id) {
  try {
    await remove(ref(db, `comments/${id}`));
    return true;
  } catch (error) {
    console.error('❌ خطا در حذف نظر:', error);
    return false;
  }
}

// ----- دریافت کاربران -----
async function getUsers() {
  try {
    const snapshot = await get(ref(db, 'users'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    // کاربر پیش‌فرض ادمین
    const adminUser = { username: 'admin', email: 'admin@game-z.ir', password: 'admin', createdAt: new Date().toLocaleDateString('fa-IR') };
    const newRef = push(ref(db, 'users'));
    await set(newRef, adminUser);
    return [adminUser];
  } catch (error) {
    console.error('❌ خطا در دریافت کاربران:', error);
    return [];
  }
}

// ----- ثبت‌نام کاربر جدید -----
async function registerUserFirebase(userData) {
  try {
    const snapshot = await get(ref(db, 'users'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const existing = Object.values(data).find(u => u.username === userData.username);
      if (existing) return { success: false, message: '❌ این نام کاربری قبلاً ثبت شده است!' };
    }
    const newRef = push(ref(db, 'users'));
    await set(newRef, userData);
    return { success: true, message: '✅ ثبت‌نام با موفقیت انجام شد!' };
  } catch (error) {
    console.error('❌ خطا در ثبت‌نام:', error);
    return { success: false, message: '❌ خطا در ثبت‌نام!' };
  }
}

// ============================================================
//  REAL-TIME LISTENERS
// ============================================================

function listenToServers(callback) {
  onValue(ref(db, 'servers'), (snapshot) => {
    const data = snapshot.val() || {};
    const servers = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    callback(servers);
  });
}

function listenToComments(callback) {
  onValue(ref(db, 'comments'), (snapshot) => {
    const data = snapshot.val() || {};
    const comments = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    callback(comments);
  });
}

// ============================================================
//  COPY IP
// ============================================================

function copyIP(ip) {
  if (!ip) {
    alert('❌ آی‌پی نامعتبر!');
    return;
  }
  navigator.clipboard.writeText(ip).then(() => {
    alert('✅ آدرس کپی شد: ' + ip);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = ip;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert('✅ آدرس کپی شد: ' + ip);
  });
}

// ============================================================
//  ADMIN FUNCTIONS (با Firebase)
// ============================================================

// ----- افزودن سرور جدید -----
window.addServer = async function() {
  const name = document.getElementById('newName')?.value?.trim();
  const region = document.getElementById('newRegion')?.value?.trim();
  const version = document.getElementById('newVersion')?.value?.trim();
  const ip = document.getElementById('newIp')?.value?.trim();
  const players = document.getElementById('newPlayers')?.value?.trim();
  const rating = document.getElementById('newRating')?.value?.trim() || '4.5';
  const game = document.getElementById('newGame')?.value;

  if (!name || !ip) {
    alert('❌ نام و آی‌پی سرور الزامی است!');
    return;
  }

  const newServer = {
    name: name,
    region: region || 'ایران',
    version: version || '1.0',
    ip: ip,
    players: players || '0',
    rating: parseFloat(rating).toFixed(1),
    game: game || 'ماینکرفت',
    status: '🟢 آنلاین',
    ping: '50ms',
    likes: 0,
    votes: 0,
    wipe: 'همیشه',
    createdAt: new Date().toISOString()
  };

  const result = await addServerFirebase(newServer);
  if (result) {
    alert('✅ سرور با موفقیت افزوده شد!');
    loadAdminData();
    // پاک کردن فرم
    document.getElementById('newName').value = '';
    document.getElementById('newRegion').value = '';
    document.getElementById('newVersion').value = '';
    document.getElementById('newIp').value = '';
    document.getElementById('newPlayers').value = '';
    document.getElementById('newRating').value = '4.5';
    document.getElementById('newGame').value = 'ماینکرفت';
  } else {
    alert('❌ خطا در افزودن سرور!');
  }
};

// ----- حذف سرور -----
window.deleteServer = async function(id) {
  if (!confirm('⚠️ آیا از حذف این سرور مطمئن هستید؟')) return;
  const result = await deleteServerFirebase(id);
  if (result) {
    loadAdminData();
  } else {
    alert('❌ خطا در حذف سرور!');
  }
};

// ----- ویرایش سرور -----
window.editServer = function(id) {
  loadServersForEdit(id);
};

async function loadServersForEdit(id) {
  const servers = await getServers();
  const server = servers.find(s => s.id === id);
  if (!server) {
    alert('❌ سرور پیدا نشد!');
    return;
  }

  document.getElementById('newName').value = server.name || '';
  document.getElementById('newRegion').value = server.region || '';
  document.getElementById('newVersion').value = server.version || '';
  document.getElementById('newIp').value = server.ip || '';
  document.getElementById('newPlayers').value = server.players || '';
  document.getElementById('newRating').value = server.rating || '4.5';
  document.getElementById('newGame').value = server.game || 'ماینکرفت';

  const btn = document.querySelector('.admin-form button');
  btn.innerHTML = '<i class="fas fa-edit"></i> ویرایش سرور';
  btn.onclick = function() {
    updateServer(id);
  };
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----- بروزرسانی سرور -----
window.updateServer = async function(id) {
  const name = document.getElementById('newName')?.value?.trim();
  const region = document.getElementById('newRegion')?.value?.trim();
  const version = document.getElementById('newVersion')?.value?.trim();
  const ip = document.getElementById('newIp')?.value?.trim();
  const players = document.getElementById('newPlayers')?.value?.trim();
  const rating = document.getElementById('newRating')?.value?.trim() || '4.5';
  const game = document.getElementById('newGame')?.value;

  if (!name || !ip) {
    alert('❌ نام و آی‌پی سرور الزامی است!');
    return;
  }

  const data = {
    name: name,
    region: region || 'ایران',
    version: version || '1.0',
    ip: ip,
    players: players || '0',
    rating: parseFloat(rating).toFixed(1),
    game: game || 'ماینکرفت'
  };

  const result = await updateServerFirebase(id, data);
  if (result) {
    alert('✅ سرور با موفقیت ویرایش شد!');
    
    // بازگشت دکمه به حالت اولیه
    const btn = document.querySelector('.admin-form button');
    btn.innerHTML = '<i class="fas fa-save"></i> افزودن سرور';
    btn.onclick = window.addServer;
    
    // پاک کردن فرم
    document.getElementById('newName').value = '';
    document.getElementById('newRegion').value = '';
    document.getElementById('newVersion').value = '';
    document.getElementById('newIp').value = '';
    document.getElementById('newPlayers').value = '';
    document.getElementById('newRating').value = '4.5';
    document.getElementById('newGame').value = 'ماینکرفت';
    
    loadAdminData();
  } else {
    alert('❌ خطا در ویرایش سرور!');
  }
};

// ----- تایید نظر -----
window.approveComment = async function(id) {
  const result = await approveCommentFirebase(id);
  if (result) {
    loadAdminData();
  }
};

// ----- رد نظر -----
window.rejectComment = async function(id) {
  if (!confirm('⚠️ آیا از رد این نظر مطمئن هستید؟')) return;
  const result = await rejectCommentFirebase(id);
  if (result) {
    loadAdminData();
  }
};

// ----- حذف نظر -----
window.deleteComment = async function(id) {
  if (!confirm('⚠️ آیا از حذف این نظر مطمئن هستید؟')) return;
  const result = await deleteCommentFirebase(id);
  if (result) {
    loadAdminData();
  }
};

// ----- حذف کاربر -----
window.deleteUser = async function(username) {
  if (username === 'admin') {
    alert('❌ نمی‌توانید ادمین اصلی را حذف کنید!');
    return;
  }
  if (!confirm(`⚠️ آیا از حذف کاربر "${username}" مطمئن هستید؟`)) return;
  
  const users = await getUsers();
  const user = users.find(u => u.username === username);
  if (user && user.id) {
    const result = await deleteCommentFirebase(user.id); // استفاده از deleteCommentFirebase برای حذف کاربر
    // در واقع باید تابع جداگانه برای حذف کاربر بنویسیم
    try {
      await remove(ref(db, `users/${user.id}`));
      loadAdminData();
    } catch (error) {
      alert('❌ خطا در حذف کاربر!');
    }
  }
};

// ----- خروج از حساب -----
window.logout = function() {
  localStorage.removeItem('gamez_current_user');
  window.location.href = 'login.html';
};

// ============================================================
//  LOAD ADMIN DATA
// ============================================================

async function loadAdminData() {
  const servers = await getServers();
  const comments = await getComments();
  const users = await getUsers();

  // ===== سرورها =====
  const serverBody = document.getElementById('serverTableBody');
  if (serverBody) {
    if (servers.length === 0) {
      serverBody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#666;padding:20px;">هیچ سروری ثبت نشده است</td></tr>`;
    } else {
      let html = '';
      servers.forEach(s => {
        const statusColor = s.status?.includes('آنلاین') ? '#22c55e' : '#ff4444';
        html += `
          <tr>
            <td>${s.name || '-'}</td>
            <td>${s.game || '-'}</td>
            <td>${s.region || '-'}</td>
            <td>${s.players || '۰'}</td>
            <td>⭐ ${s.rating || '۴.۵'}</td>
            <td style="color:${statusColor};">${s.status || '🟢 آنلاین'}</td>
            <td>
              <div class="actions">
                <button class="edit" onclick="editServer('${s.id}')"><i class="fas fa-edit"></i></button>
                <button class="delete" onclick="deleteServer('${s.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </td>
          </tr>
        `;
      });
      serverBody.innerHTML = html;
    }
  }

  // ===== نظرات در انتظار =====
  const pendingBody = document.getElementById('pendingCommentsBody');
  if (pendingBody) {
    const pending = comments.filter(c => c.status === 'pending');
    if (pending.length === 0) {
      pendingBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#666;padding:20px;">هیچ نظر در انتظاری وجود ندارد</td></tr>`;
    } else {
      let html = '';
      pending.forEach(c => {
        html += `
          <tr>
            <td>${c.user || 'کاربر مهمان'}</td>
            <td>${c.text || '-'}</td>
            <td>${c.server || '-'}</td>
            <td>${c.date || '-'}</td>
            <td class="status-pending">⏳ در انتظار</td>
            <td>
              <div class="actions">
                <button class="approve" onclick="approveComment('${c.id}')"><i class="fas fa-check"></i> تایید</button>
                <button class="reject" onclick="rejectComment('${c.id}')"><i class="fas fa-times"></i> رد</button>
              </div>
            </td>
          </tr>
        `;
      });
      pendingBody.innerHTML = html;
    }
  }

  // ===== همه نظرات =====
  const allBody = document.getElementById('allCommentsBody');
  if (allBody) {
    if (comments.length === 0) {
      allBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#666;padding:20px;">هیچ نظری ثبت نشده است</td></tr>`;
    } else {
      let html = '';
      comments.forEach(c => {
        const statusClass = c.status === 'approved' ? 'status-approved' : c.status === 'rejected' ? 'status-rejected' : 'status-pending';
        const statusText = c.status === 'approved' ? '✅ تایید شده' : c.status === 'rejected' ? '❌ رد شده' : '⏳ در انتظار';
        html += `
          <tr>
            <td>${c.user || 'کاربر مهمان'}</td>
            <td>${c.text || '-'}</td>
            <td>${c.server || '-'}</td>
            <td>${c.date || '-'}</td>
            <td class="${statusClass}">${statusText}</td>
            <td>
              <div class="actions">
                ${c.status === 'pending' ? `<button class="approve" onclick="approveComment('${c.id}')"><i class="fas fa-check"></i></button>
                <button class="reject" onclick="rejectComment('${c.id}')"><i class="fas fa-times"></i></button>` : ''}
                <button class="delete" onclick="deleteComment('${c.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </td>
          </tr>
        `;
      });
      allBody.innerHTML = html;
    }
  }

  // ===== کاربران =====
  const usersBody = document.getElementById('usersTableBody');
  if (usersBody) {
    if (users.length === 0) {
      usersBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#666;padding:20px;">هیچ کاربری ثبت نشده است</td></tr>`;
    } else {
      let html = '';
      users.forEach(u => {
        html += `
          <tr>
            <td>${u.username || '-'}</td>
            <td>${u.email || '-'}</td>
            <td>${u.createdAt || '-'}</td>
            <td>
              <div class="actions">
                ${u.username !== 'admin' ? `<button class="delete" onclick="deleteUser('${u.username}')"><i class="fas fa-trash"></i></button>` : '<span style="color:#666;font-size:0.7rem;">ادمین</span>'}
              </div>
            </td>
          </tr>
        `;
      });
      usersBody.innerHTML = html;
    }
  }

  // ===== آمار =====
  const totalServers = document.getElementById('totalServers');
  if (totalServers) totalServers.textContent = servers.length;

  const activeServers = document.getElementById('activeServers');
  if (activeServers) {
    const active = servers.filter(s => s.status?.includes('آنلاین')).length;
    activeServers.textContent = active;
  }

  const pendingComments = document.getElementById('pendingComments');
  if (pendingComments) {
    const pending = comments.filter(c => c.status === 'pending').length;
    pendingComments.textContent = pending;
  }

  const totalComments = document.getElementById('totalComments');
  if (totalComments) totalComments.textContent = comments.length;

  const totalUsers = document.getElementById('totalUsers');
  if (totalUsers) totalUsers.textContent = users.length;
}

// ============================================================
//  RENDER SERVER LIST (برای صفحات بازی)
// ============================================================

async function renderServerList(containerId, gameFilter) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ کانتینر پیدا نشد:', containerId);
    return;
  }

  let servers = await getServers();
  
  if (gameFilter) {
    servers = servers.filter(s => s.game === gameFilter);
  }

  if (servers.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#666;grid-column:1/-1;">
        <i class="fas fa-server" style="font-size:3rem;color:#333;display:block;margin-bottom:15px;"></i>
        <p>هیچ سروری در این دسته ثبت نشده است</p>
        <p style="font-size:0.85rem;margin-top:6px;">
          برای افزودن سرور به <a href="admin.html" style="color:#8B5CF6;">پنل مدیریت</a> بروید
        </p>
      </div>
    `;
    return;
  }

  let html = '';
  servers.forEach((server) => {
    const statusColor = server.status && server.status.includes('آنلاین') ? '#22c55e' : '#ff4444';
    html += `
      <div class="server-card reveal">
        <div class="top">
          <h3>${server.name || 'سرور'}</h3>
          <span class="badge" style="color:${statusColor};">
            <i class="fas fa-circle" style="font-size:0.4rem;color:${statusColor};"></i>
            ${server.status || '🟢 آنلاین'}
          </span>
        </div>
        <div class="info">
          <span><i class="fas fa-globe"></i> ${server.region || '-'}</span>
          <span><i class="fas fa-code"></i> ${server.version || '-'}</span>
          <span><i class="fas fa-users"></i> ${server.players || '۰'}</span>
          <span><i class="fas fa-clock"></i> ${server.ping || '۰ms'}</span>
        </div>
        <div class="rating"><i class="fas fa-star"></i> ${server.rating || '۴.۵'}</div>
        <div class="ip-box">${server.ip || 'آدرس نامشخص'}</div>
        <div class="actions">
          <button class="copy-btn" onclick="copyIP('${server.ip}')">
            <i class="fas fa-copy"></i> کپی
          </button>
          <a href="server-detail.html?id=${server.id}" class="detail-btn">
            <i class="fas fa-arrow-left"></i>
          </a>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  document.querySelectorAll(`#${containerId} .server-card`).forEach((el, i) => {
    setTimeout(() => el.classList.add('active'), i * 100);
  });
}

function setupSearch(searchId, containerId) {
  const search = document.getElementById(searchId);
  if (!search) return;

  search.addEventListener('keyup', function() {
    const val = this.value.toLowerCase().trim();
    const cards = document.querySelectorAll(`#${containerId} .server-card`);
    cards.forEach(c => {
      const txt = c.innerText.toLowerCase();
      c.style.display = txt.includes(val) ? '' : 'none';
    });
  });
}

// ============================================================
//  SERVER DETAIL
// ============================================================

async function loadServerDetail() {
  const params = new URLSearchParams(window.location.search);
  const serverId = params.get('id');
  
  if (!serverId) {
    const title = document.getElementById('serverTitle');
    if (title) title.textContent = '❌ سرور پیدا نشد';
    return;
  }

  const servers = await getServers();
  const server = servers.find(s => s.id === serverId);
  
  if (!server) {
    const title = document.getElementById('serverTitle');
    if (title) title.textContent = '❌ سرور پیدا نشد';
    return;
  }

  const elements = {
    serverTitle: document.getElementById('serverTitle'),
    detailName: document.getElementById('detailName'),
    region: document.getElementById('region'),
    version: document.getElementById('version'),
    players: document.getElementById('players'),
    ping: document.getElementById('ping'),
    rating: document.getElementById('rating'),
    wipe: document.getElementById('wipe'),
    ipBox: document.getElementById('ipBox'),
    starsDisplay: document.getElementById('starsDisplay'),
    likeCount: document.getElementById('likeCount'),
    ratingCount: document.getElementById('ratingCount')
  };

  if (elements.serverTitle) elements.serverTitle.textContent = server.name || 'سرور';
  if (elements.detailName) elements.detailName.textContent = server.name || 'سرور';
  if (elements.region) elements.region.textContent = server.region || '-';
  if (elements.version) elements.version.textContent = server.version || '-';
  if (elements.players) elements.players.textContent = server.players || '۰';
  if (elements.ping) elements.ping.textContent = server.ping || '۰ms';
  if (elements.rating) elements.rating.textContent = server.rating || '۴.۵';
  if (elements.wipe) elements.wipe.textContent = server.wipe || 'همیشه';
  if (elements.ipBox) elements.ipBox.textContent = server.ip || 'آدرس نامشخص';
  
  if (elements.starsDisplay) {
    const stars = parseFloat(server.rating) || 4.5;
    const fullStars = Math.floor(stars);
    const halfStar = stars - fullStars >= 0.5 ? 1 : 0;
    elements.starsDisplay.textContent = '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(5 - fullStars - halfStar);
  }
  
  if (elements.likeCount) elements.likeCount.textContent = server.likes || 0;
  if (elements.ratingCount) elements.ratingCount.textContent = `(${(server.votes || 0).toLocaleString()} رأی)`;
  
  // نظرات
  const comments = (await getComments()).filter(c => c.serverId === serverId && c.status === 'approved');
  const commentsList = document.getElementById('commentsList');
  if (commentsList) {
    if (comments.length === 0) {
      commentsList.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">💬 هنوز نظری برای این سرور ثبت نشده است</div>';
    } else {
      let html = '';
      comments.forEach(c => {
        html += `
          <div class="comment">
            <div class="user">${c.user || 'کاربر مهمان'}</div>
            <div class="text">${c.text}</div>
            <div class="date">${c.date || 'همین الان'}</div>
          </div>
        `;
      });
      commentsList.innerHTML = html;
    }
  }
}

// ============================================================
//  COMMENT FUNCTIONS (برای server-detail)
// ============================================================

window.addComment = async function() {
  const params = new URLSearchParams(window.location.search);
  const serverId = params.get('id');
  
  if (!serverId) {
    alert('❌ خطا: سرور مشخص نیست!');
    return;
  }

  const name = document.getElementById('commentName')?.value?.trim() || 'کاربر مهمان';
  const text = document.getElementById('commentText')?.value?.trim();
  
  if (!text) {
    alert('❌ لطفاً نظر خود را بنویسید!');
    return;
  }

  const servers = await getServers();
  const server = servers.find(s => s.id === serverId);
  const serverName = server ? server.name : 'سرور';

  const commentData = {
    user: name,
    text: text,
    server: serverName,
    serverId: serverId,
    date: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'),
    status: 'pending'
  };

  const result = await addCommentFirebase(commentData);
  
  if (result) {
    const commentText = document.getElementById('commentText');
    if (commentText) commentText.value = '';
    
    alert('✅ نظر شما ثبت شد و پس از تایید ادمین نمایش داده می‌شود!');
    loadServerDetail();
  } else {
    alert('❌ خطا در ثبت نظر!');
  }
};

window.vote = async function() {
  const params = new URLSearchParams(window.location.search);
  const serverId = params.get('id');
  if (!serverId) return;

  const servers = await getServers();
  const server = servers.find(s => s.id === serverId);
  if (!server) return;

  const currentRating = parseFloat(server.rating) || 4.5;
  const newRating = Math.min(5, currentRating + 0.05);
  const data = {
    rating: newRating.toFixed(1),
    votes: (server.votes || 0) + 1
  };
  
  const result = await updateServerFirebase(serverId, data);
  if (result) {
    loadServerDetail();
    alert('✅ امتیاز شما ثبت شد!');
  }
};

window.like = async function() {
  const params = new URLSearchParams(window.location.search);
  const serverId = params.get('id');
  if (!serverId) return;

  const servers = await getServers();
  const server = servers.find(s => s.id === serverId);
  if (!server) return;

  const data = { likes: (server.likes || 0) + 1 };
  const result = await updateServerFirebase(serverId, data);
  if (result) {
    loadServerDetail();
    alert('❤️ لایک کردید!');
  }
};

// ============================================================
//  LOGIN / REGISTER
// ============================================================

window.handleLogin = async function(e) {
  if (e) e.preventDefault();
  const username = document.getElementById('loginUser')?.value?.trim();
  const password = document.getElementById('loginPass')?.value?.trim();

  if (!username || !password) {
    alert('❌ لطفاً نام کاربری و رمز عبور را وارد کنید!');
    return;
  }

  const users = await getUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    alert('❌ نام کاربری یا رمز عبور اشتباه است!');
    return;
  }

  localStorage.setItem('gamez_current_user', username);
  alert(`✅ خوش آمدید ${username}!`);
  
  if (username === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'index.html';
  }
};

window.handleRegister = async function(e) {
  if (e) e.preventDefault();
  const username = document.getElementById('regUser')?.value?.trim();
  const email = document.getElementById('regEmail')?.value?.trim();
  const password = document.getElementById('regPass')?.value;
  const password2 = document.getElementById('regPass2')?.value;

  if (!username || !email || !password) {
    alert('❌ لطفاً تمام فیلدها را پر کنید!');
    return;
  }

  if (password.length < 6) {
    alert('❌ رمز عبور باید حداقل ۶ کاراکتر باشد!');
    return;
  }

  if (password !== password2) {
    alert('❌ رمز عبور و تکرار آن مطابقت ندارند!');
    return;
  }

  const userData = {
    username: username,
    email: email,
    password: password,
    createdAt: new Date().toLocaleDateString('fa-IR')
  };

  const result = await registerUserFirebase(userData);
  alert(result.message);
  
  if (result.success) {
    localStorage.setItem('gamez_current_user', username);
    window.location.href = 'index.html';
  }
};

// ============================================================
//  HEADER SHRINK
// ============================================================

function initHeaderShrink() {
  const header = document.getElementById('mainHeader');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('shrink', window.scrollY > 60);
  });
}

// ============================================================
//  MOBILE MENU
// ============================================================

function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// ============================================================
//  REVEAL ON SCROLL
// ============================================================

function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length === 0) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('active');
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));
}

// ============================================================
//  PARTICLES
// ============================================================

function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h;
  const particles = [];
  const COUNT = 50;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.3 + 0.1;
      this.color = `hsla(${Math.random() * 60 + 320}, 80%, 65%, ${this.opacity})`;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > w) this.speedX *= -1;
      if (this.y < 0 || this.y > h) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = 'rgba(255, 45, 85, 0.2)';
      ctx.shadowBlur = 8;
      ctx.fill();
    }
  }
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.05 * (1 - dist/100)})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

// ============================================================
//  USER BADGE
// ============================================================

function initUserBadge() {
  const user = localStorage.getItem('gamez_current_user');
  const badge = document.getElementById('userBadge');
  if (!badge) return;
  if (user === 'admin') {
    badge.textContent = '👑 ادمین';
    badge.classList.add('admin');
    badge.onclick = () => window.location.href = 'admin.html';
  } else if (user) {
    badge.textContent = '👤 ' + user;
  } else {
    badge.textContent = '👤 مهمان';
    badge.onclick = () => window.location.href = 'login.html';
  }
}

// ============================================================
//  INIT
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Game-Z با Firebase Loaded!');
  
  initParticles();
  initHeaderShrink();
  initMobileMenu();
  initReveal();
  initUserBadge();
  
  // ===== فرم‌های لاگین و ثبت‌نام =====
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // ===== صفحه ادمین =====
  if (document.querySelector('.admin-container')) {
    loadAdminData();
  }
  
  // ===== صفحات بازی - لیست سرورها =====
  if (document.getElementById('serversGrid')) {
    const gameMap = {
      'maincraft': 'ماینکرفت',
      'cs2': 'CS2',
      'cs16': 'CS 1.6',
      'rust': 'Rust'
    };
    const page = window.location.pathname.split('/').pop().replace('.html', '');
    const game = gameMap[page] || null;
    renderServerList('serversGrid', game);
    setupSearch('search', 'serversGrid');
  }
  
  // ===== صفحه جزئیات سرور =====
  if (document.getElementById('detailName')) {
    loadServerDetail();
  }
});