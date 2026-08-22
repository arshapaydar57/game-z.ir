// ============================================================
//  GAME-Z — لایه داده (Firebase) — ماژول
//  نکته مهم: Firebase به‌صورت import پویا (dynamic import) لود میشه و
//  با try/catch محافظت شده، تا اگر دامنه‌ی gstatic.com/firebase در
//  شبکه‌ی کاربر مسدود یا کند بود، کل اسکریپت خراب نشه و فقط پیام
//  «اتصال برقرار نشد» نشون داده بشه؛ ظاهر و منوی سایت (ui.js) هرحال کار می‌کنن.
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDveNGDQz7sXrHtAo6CEq5pnWEkhzb5fWE",
  authDomain: "game-z-dd5de.firebaseapp.com",
  databaseURL: "https://game-z-dd5de-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "game-z-dd5de",
  storageBucket: "game-z-dd5de.firebasestorage.app",
  messagingSenderId: "579411685421",
  appId: "1:579411685421:web:6db829e8046a34c72f48a4"
};

let _db = null;
let _fn = {}; // ref, get, set, push, remove, update, onValue
let _firebaseReady = null; // Promise<boolean>

function initFirebase() {
  if (_firebaseReady) return _firebaseReady;
  _firebaseReady = (async () => {
    try {
      const appMod = await import("https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js");
      const dbMod = await import("https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js");
      const app = appMod.initializeApp(firebaseConfig);
      _db = dbMod.getDatabase(app);
      _fn = {
        ref: dbMod.ref, get: dbMod.get, set: dbMod.set,
        push: dbMod.push, remove: dbMod.remove, update: dbMod.update, onValue: dbMod.onValue
      };
      return true;
    } catch (err) {
      console.error('🔥 اتصال به Firebase برقرار نشد (ممکنه دامنه مسدود باشه):', err);
      return false;
    }
  })();
  return _firebaseReady;
}
// از همون ابتدا شروع به اتصال کن (بدون بلاک کردن رندر صفحه)
initFirebase();

function connectionErrorHtml(msg) {
  return `
    <div style="text-align:center;padding:60px 20px;color:var(--text-secondary);grid-column:1/-1;">
      <i class="fas fa-plug-circle-xmark" style="font-size:3rem;color:#ff2e88;opacity:0.5;display:block;margin-bottom:16px;"></i>
      <p style="font-size:1.05rem;font-weight:700;color:#ff8fbf;">⚠️ اتصال به پایگاه داده برقرار نشد</p>
      <p style="font-size:0.85rem;margin-top:8px;">${msg || 'اتصال اینترنت یا فیلترشکن خودت رو بررسی کن و صفحه رو رفرش کن.'}</p>
    </div>`;
}

// ============================================================
//  STATE
// ============================================================
let editingServerId = null;
let currentTags = [];
let currentStatusOnline = true;

const GAME_META = {
  'ماینکرفت': { emoji: '⛏️', page: 'maincraft' },
  'CS2':      { emoji: '🔫', page: 'cs2' },
  'CS 1.6':   { emoji: '💥', page: 'cs16' },
  'Rust':     { emoji: '🛡️', page: 'rust' }
};

const domCache = {};
function getEl(id) {
  if (!domCache[id]) domCache[id] = document.getElementById(id);
  return domCache[id];
}

// توابع کمکی مشترک که در ui.js تعریف شدن
const showToast = (msg, type) => window.showToast ? window.showToast(msg, type) : console.log(msg);
const confettiBurst = (x, y) => { if (window.gzConfetti) window.gzConfetti(x, y); };
const animateNumber = (el, target) => { if (window.gzAnimateNumber) window.gzAnimateNumber(el, target); else if (el) el.textContent = target; };
const bindTilt = (el) => { if (window.gzBindTilt) window.gzBindTilt(el); };
const refreshReveal = () => { if (window.gzInitReveal) window.gzInitReveal(); };

// ============================================================
//  FIREBASE CRUD (همه محافظت‌شده با ensureFirebase)
// ============================================================
async function ensureFirebase() { return await initFirebase(); }

export async function getServers() {
  if (!(await ensureFirebase())) return null; // null = خطای اتصال، [] = واقعاً خالیه
  try {
    const snapshot = await _fn.get(_fn.ref(_db, 'servers'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
  } catch (e) { console.error('❌ خطا در دریافت سرورها:', e); return null; }
}
export async function addServerFirebase(serverData) {
  if (!(await ensureFirebase())) return null;
  try {
    const newRef = _fn.push(_fn.ref(_db, 'servers'));
    await _fn.set(newRef, serverData);
    return newRef.key;
  } catch (e) { console.error('❌ خطا در افزودن سرور:', e); return null; }
}
export async function deleteServerFirebase(id) {
  if (!(await ensureFirebase())) return false;
  try { await _fn.remove(_fn.ref(_db, `servers/${id}`)); return true; }
  catch (e) { console.error('❌ خطا در حذف سرور:', e); return false; }
}
export async function updateServerFirebase(id, data) {
  if (!(await ensureFirebase())) return false;
  try { await _fn.update(_fn.ref(_db, `servers/${id}`), data); return true; }
  catch (e) { console.error('❌ خطا در ویرایش سرور:', e); return false; }
}
export async function getComments() {
  if (!(await ensureFirebase())) return null;
  try {
    const snapshot = await _fn.get(_fn.ref(_db, 'comments'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
  } catch (e) { console.error('❌ خطا در دریافت نظرات:', e); return null; }
}
export async function addCommentFirebase(commentData) {
  if (!(await ensureFirebase())) return null;
  try {
    const newRef = _fn.push(_fn.ref(_db, 'comments'));
    await _fn.set(newRef, commentData);
    return newRef.key;
  } catch (e) { console.error('❌ خطا در افزودن نظر:', e); return null; }
}
export async function approveCommentFirebase(id) {
  if (!(await ensureFirebase())) return false;
  try { await _fn.update(_fn.ref(_db, `comments/${id}`), { status: 'approved' }); return true; }
  catch (e) { console.error('❌ خطا در تایید نظر:', e); return false; }
}
export async function rejectCommentFirebase(id) {
  if (!(await ensureFirebase())) return false;
  try { await _fn.remove(_fn.ref(_db, `comments/${id}`)); return true; }
  catch (e) { console.error('❌ خطا در رد نظر:', e); return false; }
}
export async function deleteCommentFirebase(id) {
  if (!(await ensureFirebase())) return false;
  try { await _fn.remove(_fn.ref(_db, `comments/${id}`)); return true; }
  catch (e) { console.error('❌ خطا در حذف نظر:', e); return false; }
}
export async function getUsers() {
  if (!(await ensureFirebase())) return null;
  try {
    const snapshot = await _fn.get(_fn.ref(_db, 'users'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
  } catch (e) { console.error('❌ خطا در دریافت کاربران:', e); return null; }
}
export async function registerUserFirebase(userData) {
  if (!(await ensureFirebase())) return { success: false, message: '❌ اتصال به پایگاه داده برقرار نشد. اتصال اینترنت خودت رو بررسی کن.' };
  try {
    const users = await getUsers();
    if (users && users.find(u => u.username === userData.username)) {
      return { success: false, message: '❌ این نام کاربری قبلاً ثبت شده است!' };
    }
    const newRef = _fn.push(_fn.ref(_db, 'users'));
    await _fn.set(newRef, userData);
    return { success: true, message: '✅ ثبت‌نام با موفقیت انجام شد!' };
  } catch (e) { console.error('❌ خطا در ثبت‌نام:', e); return { success: false, message: '❌ خطا در ثبت‌نام!' }; }
}
export async function deleteUserFirebase(id) {
  if (!(await ensureFirebase())) return false;
  try { await _fn.remove(_fn.ref(_db, `users/${id}`)); return true; }
  catch (e) { console.error('❌ خطا در حذف کاربر:', e); return false; }
}

// ============================================================
//  ADMIN — بخش «افزودن سرور»
// ============================================================
function parseTagsFromServer(server) {
  if (Array.isArray(server.tags)) return server.tags;
  if (typeof server.tags === 'string' && server.tags.trim()) return server.tags.split(',').map(t => t.trim()).filter(Boolean);
  return [];
}

function renderTagChips() {
  const wrap = getEl('tagChipsHolder');
  if (!wrap) return;
  wrap.querySelectorAll('.tag-chip-edit').forEach(el => el.remove());
  const input = getEl('tagInput');
  currentTags.forEach((tag, i) => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip-edit';
    chip.innerHTML = `${tag} <button type="button" data-i="${i}"><i class="fas fa-times"></i></button>`;
    wrap.insertBefore(chip, input);
  });
}

function initTagInput() {
  const input = getEl('tagInput');
  const wrap = getEl('tagChipsHolder');
  if (!input || !wrap) return;
  input.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
      e.preventDefault();
      const val = input.value.trim().replace(/,$/, '');
      if (val && !currentTags.includes(val)) { currentTags.push(val); renderTagChips(); updateLivePreview(); }
      input.value = '';
    } else if (e.key === 'Backspace' && !input.value && currentTags.length) {
      currentTags.pop(); renderTagChips(); updateLivePreview();
    }
  });
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-i]');
    if (!btn) return;
    currentTags.splice(parseInt(btn.dataset.i, 10), 1);
    renderTagChips(); updateLivePreview();
  });
}

function initGamePicker() {
  const picker = getEl('gamePicker');
  const hiddenSelect = getEl('newGame');
  if (!picker || !hiddenSelect) return;
  picker.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-game]');
    if (!btn) return;
    picker.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    hiddenSelect.value = btn.dataset.game;
    updateLivePreview();
  });
}

function initStatusSwitch() {
  const sw = getEl('statusSwitch');
  if (!sw) return;
  sw.addEventListener('click', () => {
    currentStatusOnline = !currentStatusOnline;
    sw.classList.toggle('on', currentStatusOnline);
    getEl('statusSwitchLabel').textContent = currentStatusOnline ? '🟢 آنلاین' : '🔴 آفلاین';
    updateLivePreview();
  });
}

function validateField(el, condition, msgId, msg) {
  const msgEl = getEl(msgId);
  if (!condition) { el.classList.add('field-error'); if (msgEl) msgEl.textContent = msg; return false; }
  el.classList.remove('field-error'); if (msgEl) msgEl.textContent = '';
  return true;
}

function updateLivePreview() {
  const preview = getEl('livePreviewCard');
  if (!preview) return;
  const name = getEl('newName')?.value?.trim() || 'نام سرور';
  const region = getEl('newRegion')?.value?.trim() || 'ایران';
  const version = getEl('newVersion')?.value?.trim() || '1.0';
  const ip = getEl('newIp')?.value?.trim() || 'آدرس نامشخص';
  const players = getEl('newPlayers')?.value?.trim() || '۰';
  const rating = getEl('newRating')?.value?.trim() || '4.5';
  const ping = getEl('newPing')?.value?.trim() || '۵۰ms';
  const game = getEl('newGame')?.value || 'ماینکرفت';
  const emoji = (GAME_META[game] && GAME_META[game].emoji) || '🎮';
  const statusText = currentStatusOnline ? '🟢 آنلاین' : '🔴 آفلاین';
  const tagsHtml = currentTags.map(t => `<span>${t}</span>`).join('');

  preview.innerHTML = `
    <div class="top"><h3>${emoji} ${name}</h3><span class="badge">${statusText}</span></div>
    <div class="info">
      <span><i class="fas fa-globe"></i> ${region}</span>
      <span><i class="fas fa-code"></i> ${version}</span>
      <span><i class="fas fa-users"></i> ${players}</span>
      <span><i class="fas fa-clock"></i> ${ping}</span>
    </div>
    <div class="rating"><i class="fas fa-star"></i> ${rating}</div>
    ${tagsHtml ? `<div class="tags-row">${tagsHtml}</div>` : ''}
    <div class="ip-box">${ip}</div>
    <div class="actions">
      <button class="copy-btn" type="button" disabled><i class="fas fa-copy"></i> کپی</button>
      <span class="detail-btn"><i class="fas fa-arrow-left"></i></span>
    </div>`;
}

function initLivePreviewBindings() {
  ['newName', 'newRegion', 'newVersion', 'newIp', 'newPlayers', 'newRating', 'newPing'].forEach(id => {
    const el = getEl(id);
    if (el) el.addEventListener('input', updateLivePreview);
  });
}

window.addServer = async function () {
  const nameEl = getEl('newName'), ipEl = getEl('newIp'), ratingEl = getEl('newRating');
  const name = nameEl?.value?.trim();
  const region = getEl('newRegion')?.value?.trim();
  const version = getEl('newVersion')?.value?.trim();
  const ip = ipEl?.value?.trim();
  const players = getEl('newPlayers')?.value?.trim();
  const ping = getEl('newPing')?.value?.trim();
  const wipe = getEl('newWipe')?.value?.trim();
  const rating = ratingEl?.value?.trim() || '4.5';
  const game = getEl('newGame')?.value;

  const validName = validateField(nameEl, !!name, 'errName', '❌ نام سرور الزامی است');
  const validIp = validateField(ipEl, !!ip, 'errIp', '❌ آی‌پی/آدرس سرور الزامی است');
  const ratingNum = parseFloat(rating);
  const validRating = validateField(ratingEl, !isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5, 'errRating', '❌ امتیاز باید بین ۱ تا ۵ باشد');

  if (!validName || !validIp || !validRating) { showToast('❌ لطفاً خطاهای فرم را برطرف کنید', 'error'); return; }

  const baseData = {
    name, region: region || 'ایران', version: version || '1.0', ip,
    players: players || '0', rating: ratingNum.toFixed(1), game: game || 'ماینکرفت',
    ping: ping || '50ms', wipe: wipe || 'همیشه',
    status: currentStatusOnline ? '🟢 آنلاین' : '🔴 آفلاین', tags: [...currentTags]
  };

  if (editingServerId) {
    const result = await updateServerFirebase(editingServerId, baseData);
    if (result) { showToast('✅ سرور با موفقیت ویرایش شد!', 'success'); resetAdminForm(); loadAdminData(); }
    else showToast('❌ خطا در ویرایش سرور! اتصال اینترنت را بررسی کنید.', 'error');
    return;
  }

  const newServer = { ...baseData, likes: 0, votes: 0, createdAt: new Date().toISOString() };
  const result = await addServerFirebase(newServer);
  if (result) {
    showToast('✅ سرور با موفقیت افزوده شد!', 'success');
    const btn = document.querySelector('.admin-form button');
    if (btn) { const r = btn.getBoundingClientRect(); confettiBurst(r.left + r.width / 2, r.top); }
    resetAdminForm(); loadAdminData();
  } else {
    showToast('❌ خطا در افزودن سرور! اتصال اینترنت را بررسی کنید.', 'error');
  }
};

function resetAdminForm() {
  editingServerId = null; currentTags = []; currentStatusOnline = true;
  const btn = document.querySelector('.admin-form button');
  if (btn) btn.innerHTML = '<i class="fas fa-save"></i> افزودن سرور';
  document.querySelectorAll('.admin-form input').forEach(el => {
    if (el.id === 'newRating') el.value = '4.5';
    else if (el.id !== 'tagInput') el.value = '';
    el.classList.remove('field-error');
  });
  document.querySelectorAll('.field-err-msg').forEach(m => m.textContent = '');
  const picker = getEl('gamePicker');
  if (picker) { picker.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === 0)); getEl('newGame').value = 'ماینکرفت'; }
  const sw = getEl('statusSwitch');
  if (sw) { sw.classList.add('on'); getEl('statusSwitchLabel').textContent = '🟢 آنلاین'; }
  renderTagChips(); updateLivePreview();
}
window.resetAdminForm = resetAdminForm;

window.deleteServer = async function (id) {
  if (!confirm('⚠️ آیا از حذف این سرور مطمئن هستید؟')) return;
  const result = await deleteServerFirebase(id);
  if (result) { showToast('✅ سرور حذف شد!', 'success'); loadAdminData(); }
  else showToast('❌ خطا در حذف سرور!', 'error');
};

window.editServer = async function (id) {
  const servers = await getServers();
  if (servers === null) { showToast('❌ اتصال برقرار نشد!', 'error'); return; }
  const server = servers.find(s => s.id === id);
  if (!server) { showToast('❌ سرور پیدا نشد!', 'error'); return; }

  editingServerId = id;
  currentTags = parseTagsFromServer(server);
  currentStatusOnline = !!(server.status && server.status.includes('آنلاین'));

  getEl('newName').value = server.name || '';
  getEl('newRegion').value = server.region || '';
  getEl('newVersion').value = server.version || '';
  getEl('newIp').value = server.ip || '';
  getEl('newPlayers').value = server.players || '';
  getEl('newRating').value = server.rating || '4.5';
  getEl('newPing').value = server.ping || '';
  getEl('newWipe').value = server.wipe || '';
  getEl('newGame').value = server.game || 'ماینکرفت';

  const picker = getEl('gamePicker');
  if (picker) picker.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.game === (server.game || 'ماینکرفت')));
  const sw = getEl('statusSwitch');
  if (sw) { sw.classList.toggle('on', currentStatusOnline); getEl('statusSwitchLabel').textContent = currentStatusOnline ? '🟢 آنلاین' : '🔴 آفلاین'; }

  renderTagChips(); updateLivePreview();

  const btn = document.querySelector('.admin-form button');
  if (btn) btn.innerHTML = '<i class="fas fa-edit"></i> ذخیره ویرایش';
  document.querySelector('.admin-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('✏️ در حال ویرایش: ' + server.name, 'info');
};

window.approveComment = async function (id) {
  const result = await approveCommentFirebase(id);
  if (result) { showToast('✅ نظر تایید شد!', 'success'); loadAdminData(); }
  else showToast('❌ خطا در تایید نظر!', 'error');
};
window.rejectComment = async function (id) {
  if (!confirm('⚠️ آیا از رد این نظر مطمئن هستید؟')) return;
  const result = await rejectCommentFirebase(id);
  if (result) { showToast('✅ نظر رد شد!', 'success'); loadAdminData(); }
  else showToast('❌ خطا در رد نظر!', 'error');
};
window.deleteComment = async function (id) {
  if (!confirm('⚠️ آیا از حذف این نظر مطمئن هستید؟')) return;
  const result = await deleteCommentFirebase(id);
  if (result) { showToast('✅ نظر حذف شد!', 'success'); loadAdminData(); }
  else showToast('❌ خطا در حذف نظر!', 'error');
};
window.deleteUser = async function (username) {
  if (username === 'admin') { showToast('❌ نمی‌توانید ادمین اصلی را حذف کنید!', 'error'); return; }
  if (!confirm(`⚠️ آیا از حذف کاربر "${username}" مطمئن هستید؟`)) return;
  const users = await getUsers();
  const user = users && users.find(u => u.username === username);
  if (user && user.id) {
    const result = await deleteUserFirebase(user.id);
    if (result) { showToast('✅ کاربر حذف شد!', 'success'); loadAdminData(); }
    else showToast('❌ خطا در حذف کاربر!', 'error');
  }
};
window.logout = function () {
  localStorage.removeItem('gamez_current_user');
  showToast('👋 خروج از حساب', 'info');
  setTimeout(() => window.location.href = 'login.html', 500);
};

// ============================================================
//  LOAD ADMIN DATA
// ============================================================
export async function loadAdminData() {
  const [servers, comments, users] = await Promise.all([getServers(), getComments(), getUsers()]);
  const failed = servers === null || comments === null || users === null;

  const serverBody = getEl('serverTableBody');
  if (serverBody) {
    if (failed) serverBody.innerHTML = `<tr><td colspan="7">${connectionErrorHtml()}</td></tr>`;
    else if (servers.length === 0) serverBody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);padding:30px;">📭 هیچ سروری ثبت نشده است</td></tr>`;
    else serverBody.innerHTML = servers.map(s => {
      const statusColor = s.status?.includes('آنلاین') ? 'var(--neon-green)' : '#ff2e88';
      return `<tr>
        <td><strong>${s.name || '-'}</strong></td>
        <td><span style="color:var(--neon-cyan);">${s.game || '-'}</span></td>
        <td>${s.region || '-'}</td><td>${s.players || '۰'}</td><td>⭐ ${s.rating || '۴.۵'}</td>
        <td style="color:${statusColor};font-weight:700;">${s.status || '🟢 آنلاین'}</td>
        <td><div class="actions">
          <button class="edit" onclick="editServer('${s.id}')"><i class="fas fa-edit"></i></button>
          <button class="delete" onclick="deleteServer('${s.id}')"><i class="fas fa-trash"></i></button>
        </div></td></tr>`;
    }).join('');
  }

  const pendingBody = getEl('pendingCommentsBody');
  if (pendingBody) {
    if (failed) pendingBody.innerHTML = `<tr><td colspan="6">${connectionErrorHtml()}</td></tr>`;
    else {
      const pending = comments.filter(c => c.status === 'pending');
      pendingBody.innerHTML = pending.length === 0
        ? `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:30px;">✅ هیچ نظر در انتظاری وجود ندارد</td></tr>`
        : pending.map(c => `<tr>
            <td><strong>${c.user || 'کاربر مهمان'}</strong></td><td>${c.text || '-'}</td>
            <td><span style="color:var(--neon-cyan);">${c.server || '-'}</span></td><td>${c.date || '-'}</td>
            <td class="status-pending">⏳ در انتظار</td>
            <td><div class="actions">
              <button class="approve" onclick="approveComment('${c.id}')"><i class="fas fa-check"></i> تایید</button>
              <button class="reject" onclick="rejectComment('${c.id}')"><i class="fas fa-times"></i> رد</button>
            </div></td></tr>`).join('');
    }
  }

  const allBody = getEl('allCommentsBody');
  if (allBody) {
    if (failed) allBody.innerHTML = `<tr><td colspan="6">${connectionErrorHtml()}</td></tr>`;
    else allBody.innerHTML = comments.length === 0
      ? `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:30px;">💬 هیچ نظری ثبت نشده است</td></tr>`
      : comments.map(c => {
          const statusClass = c.status === 'approved' ? 'status-approved' : c.status === 'rejected' ? 'status-rejected' : 'status-pending';
          const statusText = c.status === 'approved' ? '✅ تایید شده' : c.status === 'rejected' ? '❌ رد شده' : '⏳ در انتظار';
          return `<tr>
            <td><strong>${c.user || 'کاربر مهمان'}</strong></td><td>${c.text || '-'}</td>
            <td><span style="color:var(--neon-cyan);">${c.server || '-'}</span></td><td>${c.date || '-'}</td>
            <td class="${statusClass}">${statusText}</td>
            <td><div class="actions">
              ${c.status === 'pending' ? `<button class="approve" onclick="approveComment('${c.id}')"><i class="fas fa-check"></i></button><button class="reject" onclick="rejectComment('${c.id}')"><i class="fas fa-times"></i></button>` : ''}
              <button class="delete" onclick="deleteComment('${c.id}')"><i class="fas fa-trash"></i></button>
            </div></td></tr>`;
        }).join('');
  }

  const usersBody = getEl('usersTableBody');
  if (usersBody) {
    if (failed) usersBody.innerHTML = `<tr><td colspan="4">${connectionErrorHtml()}</td></tr>`;
    else usersBody.innerHTML = users.length === 0
      ? `<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);padding:30px;">👤 هیچ کاربری ثبت نشده است</td></tr>`
      : users.map(u => `<tr>
          <td><strong>${u.username || '-'}</strong> ${u.username === 'admin' ? '👑' : ''}</td>
          <td>${u.email || '-'}</td><td>${u.createdAt || '-'}</td>
          <td><div class="actions">
            ${u.username !== 'admin' ? `<button class="delete" onclick="deleteUser('${u.username}')"><i class="fas fa-trash"></i></button>` : '<span style="color:var(--neon-cyan);font-size:0.7rem;font-weight:700;">ادمین اصلی</span>'}
          </div></td></tr>`).join('');
  }

  if (!failed) {
    animateNumber(getEl('totalServers'), servers.length);
    animateNumber(getEl('activeServers'), servers.filter(s => s.status?.includes('آنلاین')).length);
    animateNumber(getEl('pendingComments'), comments.filter(c => c.status === 'pending').length);
    animateNumber(getEl('totalComments'), comments.length);
    animateNumber(getEl('totalUsers'), users.length);
    const pendingEl = getEl('pendingComments');
    if (pendingEl) pendingEl.classList.toggle('gz-pulse-badge', comments.filter(c => c.status === 'pending').length > 0);
  } else {
    showToast('⚠️ اتصال به پایگاه داده برقرار نشد', 'error');
  }
}

// ============================================================
//  RENDER SERVER LIST
// ============================================================
function tagsRowHtml(server) {
  const tags = parseTagsFromServer(server);
  if (!tags.length) return '';
  return `<div class="tags-row">${tags.slice(0, 4).map(t => `<span class="tag-chip">${t}</span>`).join('')}</div>`;
}

export async function renderServerList(containerId, gameFilter) {
  const container = getEl(containerId);
  if (!container) { console.error('❌ کانتینر پیدا نشد:', containerId); return; }

  let servers = await getServers();
  if (servers === null) { container.innerHTML = connectionErrorHtml(); return; }
  if (gameFilter) servers = servers.filter(s => s.game === gameFilter);

  if (servers.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:80px 20px;color:var(--text-secondary);grid-column:1/-1;">
        <i class="fas fa-server" style="font-size:4rem;color:var(--text-secondary);opacity:0.2;display:block;margin-bottom:20px;"></i>
        <p style="font-size:1.2rem;font-weight:700;color:var(--text-secondary);">هیچ سروری در این دسته ثبت نشده است</p>
        <p style="font-size:0.9rem;margin-top:8px;color:var(--text-secondary);">
          برای افزودن سرور به <a href="admin.html" style="color:var(--neon-green);font-weight:700;">پنل مدیریت</a> بروید
        </p>
      </div>`;
    return;
  }

  container.innerHTML = servers.map(server => {
    const statusColor = server.status && server.status.includes('آنلاین') ? 'var(--neon-green)' : '#ff2e88';
    return `
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
        ${tagsRowHtml(server)}
        <div class="ip-box">${server.ip || 'آدرس نامشخص'}</div>
        <div class="actions">
          <button class="copy-btn" onclick="window.copyIP('${server.ip}')"><i class="fas fa-copy"></i> کپی</button>
          <a href="server-detail.html?id=${server.id}" class="detail-btn"><i class="fas fa-arrow-left"></i></a>
        </div>
      </div>`;
  }).join('');

  document.querySelectorAll(`#${containerId} .server-card`).forEach((el, i) => {
    setTimeout(() => el.classList.add('active'), i * 80);
    bindTilt(el);
  });
  refreshReveal();
}

export function setupSearch(searchId, containerId) {
  const search = getEl(searchId);
  if (!search) return;
  search.addEventListener('input', function () {
    const val = this.value.toLowerCase().trim();
    document.querySelectorAll(`#${containerId} .server-card`).forEach(c => {
      c.style.display = c.innerText.toLowerCase().includes(val) ? '' : 'none';
    });
  });
}

// ============================================================
//  SERVER DETAIL
// ============================================================
export async function loadServerDetail() {
  const params = new URLSearchParams(window.location.search);
  const serverId = params.get('id');
  const titleEl = getEl('serverTitle');
  if (!serverId) { if (titleEl) titleEl.textContent = '❌ سرور پیدا نشد'; return; }

  const servers = await getServers();
  if (servers === null) {
    if (titleEl) titleEl.textContent = '⚠️ اتصال برقرار نشد';
    const sub = getEl('serverSub'); if (sub) sub.textContent = 'اتصال اینترنت یا فیلترشکن خودت رو بررسی کن و رفرش کن.';
    return;
  }
  const server = servers.find(s => s.id === serverId);
  if (!server) { if (titleEl) titleEl.textContent = '❌ سرور پیدا نشد'; return; }

  const els = {
    serverTitle: titleEl, serverSub: getEl('serverSub'), detailName: getEl('detailName'),
    region: getEl('region'), version: getEl('version'), players: getEl('players'), ping: getEl('ping'),
    rating: getEl('rating'), wipe: getEl('wipe'), ipBox: getEl('ipBox'), starsDisplay: getEl('starsDisplay'),
    likeCount: getEl('likeCount'), ratingCount: getEl('ratingCount')
  };
  if (els.serverTitle) els.serverTitle.textContent = server.name || 'سرور';
  if (els.serverSub) els.serverSub.textContent = `⚡ ${server.game || 'بازی'} | ${server.region || 'ایران'}`;
  if (els.detailName) els.detailName.textContent = server.name || 'سرور';
  if (els.region) els.region.textContent = server.region || '-';
  if (els.version) els.version.textContent = server.version || '-';
  if (els.players) els.players.textContent = server.players || '۰';
  if (els.ping) els.ping.textContent = server.ping || '۰ms';
  if (els.rating) els.rating.textContent = server.rating || '۴.۵';
  if (els.wipe) els.wipe.textContent = server.wipe || 'همیشه';
  if (els.ipBox) els.ipBox.textContent = server.ip || 'آدرس نامشخص';
  if (els.starsDisplay) {
    const stars = parseFloat(server.rating) || 4.5;
    const fullStars = Math.floor(stars);
    const halfStar = stars - fullStars >= 0.5 ? 1 : 0;
    els.starsDisplay.textContent = '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(5 - fullStars - halfStar);
  }
  if (els.likeCount) els.likeCount.textContent = server.likes || 0;
  if (els.ratingCount) els.ratingCount.textContent = `(${(server.votes || 0).toLocaleString()} رأی)`;

  const tags = parseTagsFromServer(server);
  const tagsHost = getEl('detailTags');
  if (tagsHost) tagsHost.innerHTML = tags.map(t => `<span class="tag-chip">${t}</span>`).join('');

  const comments = await getComments();
  const commentsList = getEl('commentsList');
  if (commentsList) {
    if (comments === null) commentsList.innerHTML = connectionErrorHtml();
    else {
      const approved = comments.filter(c => c.serverId === serverId && c.status === 'approved');
      commentsList.innerHTML = approved.length === 0
        ? '<div style="text-align:center;color:var(--text-secondary);padding:30px;">💬 هنوز نظری برای این سرور ثبت نشده است</div>'
        : approved.map(c => `<div class="comment">
            <div class="user"><i class="fas fa-user-circle"></i> ${c.user || 'کاربر مهمان'}</div>
            <div class="text">${c.text}</div><div class="date">${c.date || 'همین الان'}</div>
          </div>`).join('');
    }
  }
}

// ============================================================
//  COMMENT / VOTE / LIKE
// ============================================================
window.addComment = async function () {
  const params = new URLSearchParams(window.location.search);
  const serverId = params.get('id');
  if (!serverId) { showToast('❌ خطا: سرور مشخص نیست!', 'error'); return; }
  const name = getEl('commentName')?.value?.trim() || 'کاربر مهمان';
  const text = getEl('commentText')?.value?.trim();
  if (!text) { showToast('❌ لطفاً نظر خود را بنویسید!', 'error'); return; }

  const servers = await getServers();
  const server = servers && servers.find(s => s.id === serverId);
  const serverName = server ? server.name : 'سرور';

  const commentData = {
    user: name, text, server: serverName, serverId,
    date: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'),
    status: 'pending'
  };
  const result = await addCommentFirebase(commentData);
  if (result) {
    const ct = getEl('commentText'); if (ct) ct.value = '';
    showToast('✅ نظر شما ثبت شد و پس از تایید ادمین نمایش داده می‌شود!', 'success');
    loadServerDetail();
  } else {
    showToast('❌ خطا در ثبت نظر! اتصال اینترنت را بررسی کنید.', 'error');
  }
};

window.vote = async function (e) {
  const params = new URLSearchParams(window.location.search);
  const serverId = params.get('id');
  if (!serverId) return;
  const servers = await getServers();
  const server = servers && servers.find(s => s.id === serverId);
  if (!server) return;
  const currentRating = parseFloat(server.rating) || 4.5;
  const newRating = Math.min(5, currentRating + 0.05);
  const result = await updateServerFirebase(serverId, { rating: newRating.toFixed(1), votes: (server.votes || 0) + 1 });
  if (result) { loadServerDetail(); showToast('✅ امتیاز شما ثبت شد!', 'success'); if (e) confettiBurst(e.clientX, e.clientY); }
  else showToast('❌ خطا! اتصال اینترنت را بررسی کنید.', 'error');
};

window.like = async function (e) {
  const params = new URLSearchParams(window.location.search);
  const serverId = params.get('id');
  if (!serverId) return;
  const servers = await getServers();
  const server = servers && servers.find(s => s.id === serverId);
  if (!server) return;
  const result = await updateServerFirebase(serverId, { likes: (server.likes || 0) + 1 });
  if (result) { loadServerDetail(); showToast('❤️ لایک کردید!', 'success'); if (e) confettiBurst(e.clientX, e.clientY); }
  else showToast('❌ خطا! اتصال اینترنت را بررسی کنید.', 'error');
};

// ============================================================
//  LOGIN / REGISTER
// ============================================================
window.handleLogin = async function (e) {
  if (e) e.preventDefault();
  const username = getEl('loginUser')?.value?.trim();
  const password = getEl('loginPass')?.value?.trim();
  if (!username || !password) { showToast('❌ لطفاً نام کاربری و رمز عبور را وارد کنید!', 'error'); return; }
  const users = await getUsers();
  if (users === null) { showToast('⚠️ اتصال به پایگاه داده برقرار نشد. اتصال اینترنت خودت رو بررسی کن.', 'error'); return; }
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) { showToast('❌ نام کاربری یا رمز عبور اشتباه است!', 'error'); return; }
  localStorage.setItem('gamez_current_user', username);
  showToast(`✅ خوش آمدید ${username}!`, 'success');
  setTimeout(() => { window.location.href = username === 'admin' ? 'admin.html' : 'index.html'; }, 500);
};

window.handleRegister = async function (e) {
  if (e) e.preventDefault();
  const username = getEl('regUser')?.value?.trim();
  const email = getEl('regEmail')?.value?.trim();
  const password = getEl('regPass')?.value;
  const password2 = getEl('regPass2')?.value;
  if (!username || !email || !password) { showToast('❌ لطفاً تمام فیلدها را پر کنید!', 'error'); return; }
  if (password.length < 6) { showToast('❌ رمز عبور باید حداقل ۶ کاراکتر باشد!', 'error'); return; }
  if (password !== password2) { showToast('❌ رمز عبور و تکرار آن مطابقت ندارند!', 'error'); return; }

  const userData = { username, email, password, createdAt: new Date().toLocaleDateString('fa-IR') };
  const result = await registerUserFirebase(userData);
  showToast(result.message, result.success ? 'success' : 'error');
  if (result.success) {
    localStorage.setItem('gamez_current_user', username);
    const form = getEl('registerForm');
    if (form) { const r = form.getBoundingClientRect(); confettiBurst(r.left + r.width / 2, r.top); }
    setTimeout(() => window.location.href = 'index.html', 900);
  }
};

// ============================================================
//  LOAD HOME PAGE DATA
// ============================================================
export async function loadHomeData() {
  const servers = await getServers();
  const comments = await getComments();

  const categoriesContainer = getEl('serverCategories');
  if (categoriesContainer) {
    if (servers === null) {
      categoriesContainer.innerHTML = connectionErrorHtml('لیست دسته‌بندی‌ها بارگذاری نشد.');
    } else {
      const games = ['ماینکرفت', 'CS2', 'CS 1.6', 'Rust'];
      const icons = ['⛏️', '🔫', '💥', '🛡️'];
      const colors = ['var(--neon-green)', 'var(--neon-cyan)', 'var(--neon-purple)', '#ff2e88'];
      categoriesContainer.innerHTML = games.map((game, i) => {
        const count = servers.filter(s => s.game === game).length;
        const pageName = GAME_META[game]?.page || 'maincraft';
        return `
          <a href="${pageName}.html" class="server-cat reveal">
            <span class="icon" style="color:${colors[i]}">${icons[i]}</span>
            <h3><span>${game}</span></h3>
            <p>لیست سرورهای ${game}</p>
            <span class="count">${count} سرور</span>
          </a>`;
      }).join('');
      categoriesContainer.querySelectorAll('.server-cat').forEach(bindTilt);
    }
  }

  const topContainer = getEl('topServersGrid');
  if (topContainer) {
    if (servers === null) {
      topContainer.innerHTML = connectionErrorHtml('برترین سرورها بارگذاری نشدند.');
    } else {
      const sorted = [...servers].sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0)).slice(0, 2);
      if (sorted.length === 0) {
        topContainer.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-secondary);grid-column:1/-1;"><p>📭 هنوز سروری ثبت نشده است</p></div>`;
      } else {
        topContainer.innerHTML = sorted.map((s, i) => {
          const rank = ['🥇', '🥈'][i] || '🏅';
          return `
            <div class="top-server-card reveal">
              <span class="rank-badge">${rank} برترین</span>
              <div class="top-name">${s.name || 'سرور'}</div>
              <div class="top-game"><i class="fas fa-gamepad"></i> ${s.game || 'بازی'}</div>
              <div class="top-info">
                <span><i class="fas fa-globe"></i> ${s.region || '-'}</span>
                <span><i class="fas fa-users"></i> ${s.players || '۰'}</span>
                <span><i class="fas fa-clock"></i> ${s.ping || '۰ms'}</span>
              </div>
              <div class="top-rating"><i class="fas fa-star"></i> ${s.rating || '۴.۵'}</div>
              ${tagsRowHtml(s).replace('tags-row', 'top-tags')}
              <div class="top-ip">${s.ip || 'آدرس نامشخص'}</div>
              <div class="top-actions" style="display:flex;gap:8px;">
                <button class="copy-btn" onclick="window.copyIP('${s.ip}')"><i class="fas fa-copy"></i> کپی</button>
                <a href="server-detail.html?id=${s.id}" class="detail-btn"><i class="fas fa-arrow-left"></i></a>
              </div>
            </div>`;
        }).join('');
      }
      topContainer.querySelectorAll('.top-server-card').forEach(bindTilt);
    }
  }

  const commentsContainer = getEl('latestCommentsList');
  if (commentsContainer) {
    if (comments === null) {
      commentsContainer.innerHTML = connectionErrorHtml('نظرات بارگذاری نشدند.');
    } else {
      const approved = comments.filter(c => c.status === 'approved').slice(-5).reverse();
      commentsContainer.innerHTML = approved.length === 0
        ? `<div style="text-align:center;padding:30px;color:var(--text-secondary);">💬 هنوز نظری ثبت نشده است</div>`
        : approved.map(c => `
            <div class="comment-item reveal">
              <div class="comment-header">
                <span class="comment-user"><i class="fas fa-user-circle"></i> ${c.user || 'کاربر مهمان'}</span>
                <span class="comment-server">${c.server || 'سرور'}</span>
                <span class="comment-date">${c.date || '-'}</span>
              </div>
              <div class="comment-text">${c.text}</div>
            </div>`).join('');
    }
  }

  refreshReveal();

  if (servers !== null) {
    const total = servers.reduce((sum, s) => sum + (parseInt(s.players) || 0), 0);
    animateNumber(getEl('onlinePlayers'), total);
    animateNumber(getEl('activeServers'), servers.filter(s => s.status?.includes('آنلاین')).length);
  }
}

// ============================================================
//  INIT — این بخش کار می‌کنه حتی اگر Firebase قطع باشه
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 لایه داده (script.js) اجرا شد؛ در حال اتصال به Firebase...');

  const loginForm = getEl('loginForm');
  if (loginForm) loginForm.addEventListener('submit', window.handleLogin);
  const registerForm = getEl('registerForm');
  if (registerForm) registerForm.addEventListener('submit', window.handleRegister);

  if (document.querySelector('.admin-container')) {
    initGamePicker();
    initStatusSwitch();
    initTagInput();
    initLivePreviewBindings();
    updateLivePreview();
    loadAdminData();
  }

  if (getEl('serversGrid')) {
    const gameMap = { maincraft: 'ماینکرفت', cs2: 'CS2', cs16: 'CS 1.6', rust: 'Rust' };
    const page = window.location.pathname.split('/').pop().replace('.html', '');
    renderServerList('serversGrid', gameMap[page] || null);
    setupSearch('search', 'serversGrid');
  }

  if (getEl('detailName')) loadServerDetail();
  if (getEl('serverCategories')) loadHomeData();
});

// ============================================================
//  EXPOSE
// ============================================================
window.showToast = window.showToast || showToast;
window.loadAdminData = loadAdminData;
window.renderServerList = renderServerList;
window.loadServerDetail = loadServerDetail;
window.loadHomeData = loadHomeData;
