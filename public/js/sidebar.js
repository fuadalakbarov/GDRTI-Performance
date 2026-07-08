// GDRTI Sidebar — SVG Icons + Collapsible + Motion
// UI/UX Pro Max + Motion Framer skills

const SVG = {
  sectors: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  kanban: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5" height="18" rx="1.5"/><rect x="10" y="3" width="5" height="11" rx="1.5"/><rect x="17" y="3" width="5" height="14" rx="1.5"/></svg>`,
  analytics: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  evaluation: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  goals: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  leaderboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
  workspace: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
  letters: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  resources: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  meetingnotes: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  surveys: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 14 2 2 4-4"/></svg>`,
  profile: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  logout: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  chevron: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
};

function buildSidebar() {
  const user = getUser();
  if (!user) return;
  const MANAGER_ROLES = ['admin','director','deputy'];
  const isAdmin = user.role === 'admin';
  const isManager = MANAGER_ROLES.includes(user.role);
  const cur = location.pathname.split('/').pop() || 'index.html';

  const adminLinks = [
    { href:'admin.html',         icon:SVG.sectors,      label:'Sektorlar' },
    { href:'kanban.html',        icon:SVG.kanban,       label:'Kanban' },
    { href:'analytics.html',     icon:SVG.analytics,    label:'Analitika' },
    { href:'evaluation.html',    icon:SVG.evaluation,   label:'Qiymətləndirmə' },
    { href:'goals.html',         icon:SVG.goals,        label:'Hədəflər' },
    { href:'leaderboard.html',   icon:SVG.leaderboard,  label:'Liderboard' },
    { href:'workspace.html',     icon:SVG.workspace,    label:'Workspace' },
    { href:'whiteboard.html',   icon:`<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='3' width='20' height='14' rx='2'/><path d='M8 21h8M12 17v4'/><path d='M7 8l3 3 4-4'/></svg>`, label:'İş Lenti' },
    { href:'letters.html',       icon:SVG.letters,      label:'Məktublar' },
    { href:'resources.html',     icon:SVG.resources,    label:'Resurslar' },
    { href:'calendar.html',      icon:SVG.calendar,     label:'Kalendar' },
    { href:'meeting-notes.html', icon:SVG.meetingnotes, label:'Görüş protokolu' },
    { href:'surveys.html',       icon:SVG.surveys,      label:'Sorğular' },
    { href:'profile.html',       icon:SVG.profile,      label:'Profilim' },
  ];
  const empLinks = [
    { href:'my-dashboard.html',  icon:SVG.dashboard,    label:'Mənim Panelim' },
    { href:'kanban.html',        icon:SVG.kanban,       label:'Kanban' },
    { href:'analytics.html',     icon:SVG.analytics,    label:'Analitika' },
    { href:'leaderboard.html',   icon:SVG.leaderboard,  label:'Liderboard' },
    { href:'workspace.html',     icon:SVG.workspace,    label:'Workspace' },
    { href:'whiteboard.html',    icon:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8l3 3 4-4"/></svg>`, label:'İş Lenti' },
    { href:'letters.html',       icon:SVG.letters,      label:'Məktublar' },
    { href:'resources.html',     icon:SVG.resources,    label:'Resurslar' },
    { href:'calendar.html',      icon:SVG.calendar,     label:'Kalendar' },
    { href:'surveys.html',       icon:SVG.surveys,      label:'Sorğular' },
    { href:'profile.html',       icon:SVG.profile,      label:'Profilim' },
  ];

  const links = isManager ? adminLinks : empLinks;
  const collapsed = localStorage.getItem('sidebar_collapsed') === '1';

  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  if (collapsed) sidebar.classList.add('collapsed');

  sidebar.innerHTML = `
    <div class="sb-header">
      <div class="sb-logo">
        <div class="logo-badge">🎓</div>
        <span class="sb-label sb-title">GDRTI</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;">
        <button id="sbNotifBtn" class="sb-icon-btn" title="Bildirişlər" onclick="toggleNotifPanel()">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span id="sbNotifCount" style="display:none;position:absolute;top:-3px;right:-3px;background:#ef4444;color:#fff;font-size:.55rem;font-weight:800;min-width:15px;height:15px;border-radius:8px;display:none;align-items:center;justify-content:center;padding:0 3px;border:1.5px solid #312e81;"></span>
        </button>
        <button class="sb-toggle" onclick="toggleSidebar()" aria-label="Sidebar aç/bağla" title="Sidebar">
          <span class="sb-toggle-icon">${SVG.chevron}</span>
        </button>
      </div>
    </div>

    <div class="sb-search-wrap">
      <div class="sb-search-icon">${SVG.search}</div>
      <input id="globalSearch" type="text" class="sb-label" placeholder="Axtar..."
        oninput="globalSearchFn(this.value)"
        onfocus="this.closest('.sb-search-wrap').classList.add('focused')"
        onblur="this.closest('.sb-search-wrap').classList.remove('focused')">
      <div id="searchResults" class="search-dropdown"></div>
    </div>

    <nav class="sb-nav">
      ${links.map((l,i) => `
        <a href="/${l.href}"
           class="sb-link ${cur===l.href?'active':''}"
           title="${l.label}"
           style="--i:${i}">
          <span class="sb-icon">${l.icon}</span>
          <span class="sb-label">${l.label}</span>
          ${cur===l.href?'<span class="sb-active-dot"></span>':''}
        </a>`).join('')}
    </nav>

    <div class="sb-footer">
      <div class="sb-user sb-label">
        <div class="sb-avatar">${user.photo_url?`<img src="${user.photo_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`:`<span>${initials(user.full_name)}</span>`}</div>
        <div class="sb-user-info">
          <div class="sb-user-name">${user.full_name}</div>
          <div class="sb-user-role">${isManager?(isAdmin?'Admin':user.role==='director'?'Müdir':'Müavin'):(user.position||'İşçi')}</div>
        </div>
      </div>
      <a href="#" onclick="logout()" class="sb-link sb-logout" title="Çıxış">
        <span class="sb-icon">${SVG.logout}</span>
        <span class="sb-label">Çıxış</span>
      </a>
    </div>
  `;

  buildNotificationBell();
  loadAnnouncementBanner();
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  const collapsed = sidebar.classList.toggle('collapsed');
  localStorage.setItem('sidebar_collapsed', collapsed ? '1' : '0');
}

// ─── GLOBAL AXTARIŞ ──────────────────────────────────────────
let searchCache = null, searchTimer = null;

async function globalSearchFn(q) {
  const resEl = document.getElementById('searchResults');
  if (!resEl) return;
  if (!q.trim()) { resEl.style.display='none'; return; }
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    try {
      if (!searchCache) {
        const [employees, tasks, letters] = await Promise.all([
          apiCall('/employees/contacts').catch(()=>[]),
          apiCall('/tasks/mine').catch(()=>[]),
          apiCall('/letters/mine').catch(()=>[]),
        ]);
        searchCache = { employees, tasks, letters };
      }
      const ql = q.toLowerCase();
      const results = [];
      (searchCache.employees||[]).forEach(e => {
        if (e.full_name.toLowerCase().includes(ql))
          results.push({ icon:'👤', label:e.full_name, sub:e.position||'İşçi', href:`/employee-detail.html?id=${e.id}` });
      });
      (searchCache.tasks||[]).forEach(t => {
        if (t.title.toLowerCase().includes(ql))
          results.push({ icon:'📋', label:t.title, sub:t.status, href:'/my-dashboard.html' });
      });
      (searchCache.letters||[]).forEach(l => {
        if (l.subject.toLowerCase().includes(ql))
          results.push({ icon:'✉️', label:l.subject, sub:new Date(l.created_at).toLocaleDateString('az-AZ'), href:'/letters.html' });
      });
      if (!results.length) {
        resEl.innerHTML='<div class="sr-empty">Nəticə tapılmadı</div>';
      } else {
        resEl.innerHTML=results.slice(0,7).map(r=>`
          <a href="${r.href}" class="sr-item">
            <span class="sr-icon">${r.icon}</span>
            <div><div class="sr-label">${r.label}</div><div class="sr-sub">${r.sub}</div></div>
          </a>`).join('');
      }
      resEl.style.display='block';
    } catch(e){}
  }, 280);
}

document.addEventListener('click', e => {
  if (!e.target.closest('.sb-search-wrap')) {
    const el = document.getElementById('searchResults');
    if (el) el.style.display='none';
  }
});

// ─── NOTIFICATION SƏSİ ───────────────────────────────────────
function playNotifSound(type = 'message') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (type === 'message') {
      // 2 notlu xoş çınıltı
      const notes = [880, 1100];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.25);
      });
    } else {
      // Bildiriş — tək not
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch(e) {} // AudioContext dəstəklənmirsə susur
}

// ─── BİLDİRİŞ BELL (sidebar-da) ─────────────────────────────
let notifPanel = null;

function buildNotificationBell(){
  // Ayrı bell yaratmırıq — sidebar header-dakı sbNotifBtn istifadə edirik
  if (!notifPanel) {
    notifPanel = document.createElement('div');
    notifPanel.id = 'notifPanel';
    notifPanel.innerHTML = `
      <div class="np-head"><b>Bildirişlər</b><button onclick="markAllRead()" class="np-read-btn">Hamısını oxu</button></div>
      <div id="notifList" class="np-list"></div>`;
    document.body.appendChild(notifPanel);
  }
  updateNotifCount();
  setInterval(updateNotifCount, 30000);
}

async function updateNotifCount(){
  try{
    const {count} = await apiCall('/notifications/count');
    const badge = document.getElementById('sbNotifCount');
    if (!badge) return;
    const prev = parseInt(badge.dataset.prev || '0');
    if (count > 0) {
      badge.style.display = 'inline-flex';
      badge.textContent = count > 9 ? '9+' : count;
      if (count > prev && prev >= 0) playNotifSound('notif');
    } else {
      badge.style.display = 'none';
    }
    badge.dataset.prev = count;
    // Sidebar icon-da da göstər
    const btn = document.getElementById('sbNotifBtn');
    if (btn) btn.style.color = count > 0 ? '#fca5a5' : 'rgba(255,255,255,.7)';
  } catch(e) {}
}

async function toggleNotifPanel(){
  if (!notifPanel) return;
  const open = notifPanel.classList.toggle('open');
  // Panel mövqeyini sidebar yaxınında qur
  const btn = document.getElementById('sbNotifBtn');
  if (btn && open) {
    const rect = btn.getBoundingClientRect();
    notifPanel.style.top = (rect.bottom + 8) + 'px';
    notifPanel.style.left = Math.max(8, rect.left - 280) + 'px';
    notifPanel.style.right = 'auto';
  }
  if (open) await loadNotifications();
}

document.addEventListener('click',e=>{
  if(notifPanel&&!notifPanel.contains(e.target)&&!document.getElementById('notifBell')?.contains(e.target))
    notifPanel.classList.remove('open');
});

async function loadNotifications(){
  const list=document.getElementById('notifList');
  if(!list)return;
  list.innerHTML='<div class="np-loading">Yüklənir...</div>';
  try{
    const notifs=await apiCall('/notifications');
    if(!notifs.length){list.innerHTML='<div class="np-empty">Bildiriş yoxdur</div>';return;}
    list.innerHTML=notifs.map(n=>`
      <div class="np-item ${n.is_read?'':'unread'}" onclick="goNotif('${n.id}','${n.link||'#'}')">
        <div class="np-dot" style="${!n.is_read?'':'opacity:0'}"></div>
        <div class="np-body">
          <div class="np-title">${n.title}</div>
          ${n.body?`<div class="np-sub">${n.body}</div>`:''}
          <div class="np-time">${timeAgo(n.created_at)}</div>
        </div>
      </div>`).join('');
  }catch(e){list.innerHTML=`<div class="np-empty">${e.message}</div>`;}
}

async function goNotif(id,link){
  try{await apiCall(`/notifications/${id}/read`,'PATCH');}catch(e){}
  updateNotifCount();
  if(link&&link!=='#')location.href=link;
}
async function markAllRead(){
  try{await apiCall('/notifications/read-all','PATCH');}catch(e){}
  updateNotifCount();
  loadNotifications();
}

// ─── ELAN BANNER ─────────────────────────────────────────────
async function loadAnnouncementBanner(){
  try{
    const anns=await apiCall('/announcements');
    if(!anns.length)return;
    const main=document.querySelector('.main');
    if(!main||document.getElementById('announceBanner'))return;
    const banner=document.createElement('div');
    banner.id='announceBanner';
    banner.innerHTML=anns.map(a=>`
      <div class="ann-item">
        <div class="ann-content">
          <span class="ann-icon">${a.is_pinned?'📌':'📣'}</span>
          <div><div class="ann-title">${a.title}</div><div class="ann-body">${a.body}</div></div>
        </div>
        <button onclick="this.closest('.ann-item').remove()">✕</button>
      </div>`).join('');
    const topbar=main.querySelector('.topbar');
    if(topbar)main.insertBefore(banner,topbar.nextSibling);
    else main.prepend(banner);
  }catch(e){}
}

// ─── AI KÖMƏKÇİ ──────────────────────────────────────────────
function buildAIButton(){
  if(document.getElementById('aiBubble'))return;
  const bubble=document.createElement('button');
  bubble.id='aiBubble';
  bubble.title='AI Köməkçi';
  bubble.innerHTML=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 1 1 0 16A8 8 0 0 1 12 2z"/><path d="M12 8v4l3 3"/><path d="M16.24 16.24 19 19"/></svg>✨`;
  bubble.onclick=toggleAI;
  document.body.appendChild(bubble);

  const panel=document.createElement('div');
  panel.id='aiPanel';
  panel.innerHTML=`
    <div class="ai-head">
      <div style="display:flex;align-items:center;gap:8px;">
        <span>✨ AI Köməkçi</span>
        <select id="aiMode" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:7px;padding:3px 8px;font-size:.72rem;font-family:inherit;cursor:pointer;" onchange="setAIMode(this.value)">
          <option value="general">💬 Ümumi</option>
          <option value="letter">✉️ Məktub yaz</option>
          <option value="summary">📄 Xülasə et</option>
          <option value="analyze">🔍 Analiz et</option>
        </select>
      </div>
      <div style="display:flex;gap:4px;align-items:center;">
        <button onclick="toggleAIFullscreen()" id="aiFullscreenBtn" title="Tam ekran" style="background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:7px;padding:4px 9px;cursor:pointer;font-size:.72rem;">⛶</button>
        <button onclick="clearAIChat()" title="Təmizlə" style="background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:7px;padding:4px 9px;cursor:pointer;font-size:.72rem;">🗑</button>
        <button onclick="document.getElementById('aiPanel').classList.remove('open','ai-fullscreen')" style="background:rgba(255,255,255,.15);border:none;color:#fff;width:26px;height:26px;border-radius:7px;cursor:pointer;">✕</button>
      </div>
    </div>

    <!-- Sürətli düymələr -->
    <div class="ai-quickbtns" id="aiQuickBtns">
      <button onclick="aiQuick('Rəsmi müraciət məktubu yaz: GDRTI-dən məktəb müdirinə məktub, mövzu: müəllim ixtisasartırma kursu haqqında')">📝 Müraciət məktubu</button>
      <button onclick="aiQuick('Rəsmi bildiriş məktubu yaz: işçilərə aylıq iclasın tarixi haqqında məlumat')">📅 Bildiriş</button>
      <button onclick="aiQuick('Tapşırığın icrası haqqında hesabat mətni yaz. Tapşırıq: ')">📊 Hesabat</button>
      <button onclick="aiQuick('GDRTI-nin fəaliyyəti haqqında qısa icmal hazırla')">🏫 İcmal</button>
    </div>

    <!-- Fayl bildirişi -->
    <div id="aiFileNotice" style="display:none;background:rgba(255,255,255,.1);margin:6px 10px;border-radius:8px;padding:7px 10px;font-size:.76rem;color:rgba(255,255,255,.85);display:none;align-items:center;gap:7px;">
      <span id="aiFileIcon">📎</span>
      <span id="aiFileName" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"></span>
      <button onclick="clearAIFile()" style="background:none;border:none;color:rgba(255,100,100,.8);cursor:pointer;font-size:.9rem;">✕</button>
    </div>

    <div id="aiMessages" class="ai-msgs">
      <div class="ai-msg ai-bot">Salam! Məktub yazmaq, sənəd analiz etmək və ya sual vermək üçün buradayam 😊<br><small style="opacity:.65;">Fayl əlavə edib analiz etdirə, məktub modu ilə rəsmi məktub hazırlaya bilərsiniz.</small></div>
    </div>

    <div class="ai-input-row">
      <input type="file" id="aiFileInput" accept=".txt,.pdf,.docx,.doc,.csv" style="display:none" onchange="handleAIFile(this)">
      <button onclick="document.getElementById('aiFileInput').click()" title="Fayl əlavə et" style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;border-radius:9px;width:36px;height:36px;cursor:pointer;font-size:.9rem;flex-shrink:0;display:flex;align-items:center;justify-content:center;">📎</button>
      <input id="aiInput" type="text" placeholder="Sual yazın..." onkeydown="if(event.key==='Enter'&&!event.shiftKey)sendAI()">
      <button onclick="sendAI()" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;border-radius:9px;width:36px;height:36px;cursor:pointer;font-size:.85rem;flex-shrink:0;">→</button>
    </div>
  `;
  document.body.appendChild(panel);
}

let aiHistory = [], aiCurrentMode = 'general', aiFileContent = null, aiFileName = null;

function setAIMode(mode){
  aiCurrentMode = mode;
  const hints = {
    general:'💬 Ümumi sual — hər şeyi soruşa bilərsiniz',
    letter:'✉️ Məktub modu — mövzunu yazın, məktub hazırlayım',
    summary:'📄 Xülasə modu — mətni yapışdırın, xülasə edim',
    analyze:'🔍 Analiz modu — fayl əlavə edin və ya mətni yapışdırın'
  };
  const input = document.getElementById('aiInput');
  if(input) input.placeholder = hints[mode] || 'Sual yazın...';
}

function aiQuick(prompt){
  const input = document.getElementById('aiInput');
  if(input){ input.value = prompt; input.focus(); }
}

function clearAIChat(){
  aiHistory = []; aiFileContent = null; aiFileName = null;
  document.getElementById('aiFileNotice').style.display = 'none';
  document.getElementById('aiMessages').innerHTML = '<div class="ai-msg ai-bot">Söhbət silindi. Yenidən başlaya bilərik! 😊</div>';
}

function clearAIFile(){
  aiFileContent = null; aiFileName = null;
  document.getElementById('aiFileNotice').style.display = 'none';
  document.getElementById('aiFileInput').value = '';
}

async function handleAIFile(input){
  const file = input.files[0];
  if(!file) return;
  aiFileName = file.name;

  const notice = document.getElementById('aiFileNotice');
  document.getElementById('aiFileName').textContent = file.name;
  document.getElementById('aiFileIcon').textContent = file.name.endsWith('.pdf') ? '📕' : file.name.endsWith('.docx')||file.name.endsWith('.doc') ? '📘' : '📄';
  notice.style.display = 'flex';

  try {
    if(file.type === 'text/plain' || file.name.endsWith('.csv') || file.name.endsWith('.txt')){
      aiFileContent = await file.text();
    } else if(file.name.endsWith('.pdf')){
      // PDF.js ilə mətn çıxar
      aiFileContent = await extractPDFText(file);
    } else if(file.name.endsWith('.docx') || file.name.endsWith('.doc')){
      aiFileContent = await extractDocxText(file);
    } else {
      aiFileContent = `[${file.name} faylı]`;
    }
    addAIMsg(`📎 <b>${file.name}</b> əlavə edildi. İndi fayl haqqında sual verə bilərsiniz.`, 'ai-bot');
  } catch(e){
    addAIMsg(`❌ Fayl oxunarkən xəta: ${e.message}`, 'ai-bot');
    clearAIFile();
  }
}

async function extractPDFText(file){
  // PDF.js CDN yüklə
  if(!window.pdfjsLib){
    await new Promise((res,rej)=>{
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.onload=()=>{ window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; res(); };
      s.onerror=rej; document.head.appendChild(s);
    });
  }
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
  let text = '';
  for(let i=1; i<=Math.min(pdf.numPages, 10); i++){
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(s=>s.str).join(' ') + '\n';
  }
  return text.trim() || '[PDF boşdur və ya şəkil formatındadır]';
}

async function extractDocxText(file){
  if(!window.mammoth){
    await new Promise((res,rej)=>{
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
      s.onload=res; s.onerror=rej; document.head.appendChild(s);
    });
  }
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({arrayBuffer});
  return result.value || '[Sənəd boşdur]';
}

function addAIMsg(html, cls){
  const msgs = document.getElementById('aiMessages');
  if(!msgs) return;
  msgs.innerHTML += `<div class="ai-msg ${cls}">${html}</div>`;
  msgs.scrollTop = msgs.scrollHeight;
}

function toggleAIFullscreen(){
  const panel = document.getElementById('aiPanel');
  const btn   = document.getElementById('aiFullscreenBtn');
  const fs    = panel.classList.toggle('ai-fullscreen');
  if (btn) btn.textContent = fs ? '⊡' : '⛶';
  if (btn) btn.title = fs ? 'Kiçilt' : 'Tam ekran';
}

function toggleAI(){ document.getElementById('aiPanel')?.classList.toggle('open'); document.getElementById('aiInput')?.focus(); }

async function sendAI(){
  const input = document.getElementById('aiInput');
  const msg = input?.value.trim();
  if(!msg && !aiFileContent) return;
  input.value = '';

  const displayMsg = msg || `📎 ${aiFileName} faylını analiz et`;
  addAIMsg(displayMsg, 'ai-user');

  const loadId = 'ai-l-'+Date.now();
  addAIMsg(`<span class="ai-dots"><span></span><span></span><span></span></span>`, 'ai-bot');
  document.getElementById(loadId-1 || loadId)?.setAttribute('id', loadId);
  // Sonuncu ai-bot mesajına id ver
  const msgs = document.getElementById('aiMessages');
  const lastBot = msgs.querySelectorAll('.ai-bot');
  const loader = lastBot[lastBot.length-1];
  if(loader) loader.id = loadId;

  try{
    const res = await apiCall('/ai/chat','POST',{
      message: msg,
      history: aiHistory,
      mode: aiCurrentMode,
      fileContent: aiFileContent,
      fileName: aiFileName
    });
    document.getElementById(loadId)?.remove();
    aiHistory = res.messages;

    // Fayl göndərildikdən sonra sil (bir dəfəlik)
    if(aiFileContent){ aiFileContent = null; clearAIFile(); }

    // Cavab + endirmə düyməsi
    const replyId = 'air-'+Date.now();
    msgs.innerHTML += `
      <div class="ai-msg ai-bot" id="${replyId}">
        <div class="ai-reply-text">${res.reply.replace(/\n/g,'<br>')}</div>
        <div class="ai-reply-actions">
          <button onclick="copyAIReply('${replyId}')" title="Kopyala">📋 Kopyala</button>
          <button onclick="downloadAIReply('${replyId}','txt')" title="TXT endir">⬇️ TXT</button>
          <button onclick="downloadAIReply('${replyId}','docx')" title="Word endir">📝 Word</button>
        </div>
      </div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }catch(e){
    document.getElementById(loadId).textContent = '❌ '+e.message;
  }
}

function copyAIReply(id){
  const text = document.getElementById(id)?.querySelector('.ai-reply-text')?.innerText || '';
  navigator.clipboard.writeText(text).catch(()=>{});
}

function downloadAIReply(id, fmt){
  const text = document.getElementById(id)?.querySelector('.ai-reply-text')?.innerText || '';
  const date = new Date().toISOString().slice(0,10);
  if(fmt === 'txt'){
    const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`AI-cavab-${date}.txt`; a.click();
  } else {
    // Sadə HTML Word sənədi
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;font-size:12pt;line-height:1.6;margin:2cm;}</style></head>
<body>${text.replace(/\n/g,'<br>')}</body></html>`;
    const blob = new Blob([html],{type:'application/msword'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`AI-cavab-${date}.doc`; a.click();
  }
}

// ─── BAŞLAT ──────────────────────────────────────────────────
(function(){
  function _init(){
    if(typeof getToken==='function'&&getToken()){
      buildSidebar();
      buildAIButton();
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',_init);
  else _init();
})();
