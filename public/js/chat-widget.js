// Bütün səhifələrdə FB Messenger tipli üzən çat widget-i.
// İstifadə: <script src="/js/chat-widget.js"></script> (api.js-dən sonra)

(function () {
  if (!getToken()) return; // login olmayıbsa göstərmə

  const me = getUser();
  let activeContact = null;
  let contacts = [];
  let pollTimer = null;

  // --- DOM qur ---
  const bubble = document.createElement('button');
  bubble.className = 'cw-bubble';
  bubble.innerHTML = `💬<span class="cw-badge" id="cwBadge" style="display:none;">0</span>`;
  document.body.appendChild(bubble);

  const panel = document.createElement('div');
  panel.className = 'cw-panel';
  panel.innerHTML = `
    <div class="cw-header">
      <span class="cw-back" id="cwBack">←</span>
      <span id="cwTitle">Mesajlar</span>
      <span class="cw-close" id="cwClose">✕</span>
    </div>
    <div class="cw-body">
      <div id="cwListView"></div>
      <div class="cw-thread" id="cwThreadView">
        <div class="cw-thread-messages" id="cwMessages"></div>
        <form class="cw-input-row" id="cwForm">
          <input type="text" id="cwInput" placeholder="Mesaj yazın..." autocomplete="off">
          <button type="submit">➤</button>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  bubble.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) loadList();
  });
  document.getElementById('cwClose').addEventListener('click', () => panel.classList.remove('open'));
  document.getElementById('cwBack').addEventListener('click', showList);

  function showList() {
    activeContact = null;
    document.getElementById('cwListView').style.display = 'block';
    document.getElementById('cwThreadView').classList.remove('open');
    document.getElementById('cwBack').classList.remove('show');
    document.getElementById('cwTitle').textContent = 'Mesajlar';
    loadList();
  }

  async function loadList() {
    try {
      contacts = await apiCall('/employees/contacts');
      const convos = await apiCall('/messages/conversations');
      const convoMap = new Map(convos.map(c => [c.other_id, c]));
      const listEl = document.getElementById('cwListView');

      const sorted = [...contacts].sort((a, b) => {
        const ca = convoMap.get(a.id), cb = convoMap.get(b.id);
        if (ca && !cb) return -1;
        if (!ca && cb) return 1;
        if (ca && cb) return new Date(cb.last_at) - new Date(ca.last_at);
        return a.full_name.localeCompare(b.full_name);
      });

      listEl.innerHTML = sorted.map(c => {
        const convo = convoMap.get(c.id);
        const phone = (c.phone||'').replace(/\s+/g,'').replace(/^\+/,'');
        const waLink = phone ? `https://wa.me/${phone}` : null;
        return `
        <div class="cw-list-item" data-id="${c.id}" data-name="${c.full_name.replace(/"/g,'&quot;')}">
          ${c.photo_url ? `<img class="emp-photo" style="width:38px;height:38px;font-size:.8rem;" src="${c.photo_url}">` : `<div class="emp-photo" style="width:38px;height:38px;font-size:.8rem;">${initials(c.full_name)}</div>`}
          <div style="flex:1; min-width:0;">
            <div style="font-size:.85rem; font-weight:600;">${c.full_name}</div>
            <div style="font-size:.74rem; color:var(--text-dim); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${convo ? convo.last_message : (c.position || (c.role === 'admin' ? 'Rəhbər' : ''))}</div>
          </div>
          ${waLink ? `<a href="${waLink}" target="_blank" onclick="event.stopPropagation();" title="WhatsApp" style="flex-shrink:0;font-size:1.1rem;text-decoration:none;">📱</a>` : ''}
          ${convo && convo.unread ? `<span class="dot" style="background:var(--indigo); width:8px; height:8px;"></span>` : ''}
        </div>`;
      }).join('') || '<div class="cw-empty">Kontakt yoxdur</div>';

      listEl.querySelectorAll('.cw-list-item').forEach(el => {
        el.addEventListener('click', () => openThread(el.dataset.id, el.dataset.name));
      });

      updateBadge(convos);
    } catch (e) { /* səssiz */ }
  }

  function updateBadge(convos) {
    const unread = convos.reduce((s, c) => s + (c.unread || 0), 0);
    const badge = document.getElementById('cwBadge');
    const prev = parseInt(badge.dataset.prev || '0');
    if (unread > 0) {
      badge.style.display = 'flex';
      badge.textContent = unread > 9 ? '9+' : unread;
      // Yeni mesaj gəlibsə səs çal (panel bağlıdırsa)
      if (unread > prev && !panel.classList.contains('open')) {
        if (typeof playNotifSound === 'function') playNotifSound('message');
        else playMsgSound();
      }
    } else {
      badge.style.display = 'none';
    }
    badge.dataset.prev = unread;
  }

  // Sidebar yüklənməmişsə öz sadə səsimiz
  function playMsgSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [880, 1100].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine'; o.frequency.value = freq;
        g.gain.setValueAtTime(0, ctx.currentTime + i*0.12);
        g.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i*0.12 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i*0.12 + 0.22);
        o.start(ctx.currentTime + i*0.12);
        o.stop(ctx.currentTime + i*0.12 + 0.22);
      });
    } catch(e) {}
  }

  async function openThread(id, name) {
    activeContact = id;
    document.getElementById('cwListView').style.display = 'none';
    document.getElementById('cwThreadView').classList.add('open');
    document.getElementById('cwBack').classList.add('show');
    document.getElementById('cwTitle').textContent = name;
    await renderMessages();
  }

  async function renderMessages() {
    if (!activeContact) return;
    try {
      const msgs = await apiCall(`/messages/thread/${activeContact}`);
      const box = document.getElementById('cwMessages');
      box.innerHTML = msgs.map(m => `<div class="cw-msg ${m.sender_id === me.id ? 'mine' : 'theirs'}">${m.content}</div>`).join('')
        || '<div class="cw-empty">Hələ mesaj yoxdur</div>';
      box.scrollTop = box.scrollHeight;
    } catch (e) { /* səssiz */ }
  }

  document.getElementById('cwForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('cwInput');
    const content = input.value.trim();
    if (!content || !activeContact) return;
    input.value = '';
    try {
      await apiCall('/messages', 'POST', { receiver_id: activeContact, content });
      renderMessages();
    } catch (err) { alert(err.message); }
  });

  // Fon rejimində oxunmamışları izləyirik
  async function pollUnread() {
    try {
      const convos = await apiCall('/messages/conversations');
      updateBadge(convos);
      if (panel.classList.contains('open') && !activeContact) loadList();
      if (panel.classList.contains('open') && activeContact) renderMessages();
    } catch (e) { /* səssiz */ }
  }
  pollUnread();
  pollTimer = setInterval(pollUnread, 8000);
})();
