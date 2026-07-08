(function(){
  if (document.getElementById('musicBubble')) return;

  // Real, yoxlanılmış YouTube video ID-ləri
  const tracks = [
    { title: 'Sarı Gəlin',              artist: 'Azərbaycan Xalq Musiqisi', yt: 'pRxozytrscI' },
    { title: 'Vagif Mustafazadə — Jazz',artist: 'Jazz Compositions 1975',  yt: 'Olq8Oc53uCY' },
    { title: 'Vagif Mustafazadə — Piano',artist: 'Fantaziya (Piano)',       yt: 'QYZG6OnqIQU' },
    { title: 'Alim Qasımov — Segah',    artist: 'Muğam Segah',             yt: 'xOWtVTJrmOo' },
    { title: 'Sarı Gəlin (Piano)',       artist: 'Azərbaycan Piano',        yt: 'mb5VmCUSgZM' },
    { title: 'Alim Qasımov — Muğam',    artist: 'Klassik Muğam',           yt: '0Q6G8HcERMw' },
  ];

  let cur = 0;

  const css = `
    #musicBubble{position:fixed;bottom:148px;right:24px;width:48px;height:48px;border-radius:50%;
      background:linear-gradient(135deg,#e53935,#c62828);color:#fff;border:none;
      box-shadow:0 4px 18px rgba(197,40,40,.5);display:flex;align-items:center;
      justify-content:center;font-size:1.2rem;cursor:pointer;z-index:197;}
    #musicBubble.on{animation:mpulse 1.5s ease infinite;}
    @keyframes mpulse{0%,100%{box-shadow:0 4px 18px rgba(197,40,40,.5)}50%{box-shadow:0 4px 28px rgba(197,40,40,.9),0 0 0 8px rgba(197,40,40,.15)}}
    #musicPanel{position:fixed;bottom:206px;right:24px;width:300px;
      background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.2);
      z-index:197;display:none;overflow:hidden;border:1px solid #eee;}
    .mp-hd{background:linear-gradient(135deg,#e53935,#c62828);padding:12px 16px;color:#fff;display:flex;justify-content:space-between;align-items:center;}
    .mp-title{font-weight:700;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;}
    .mp-artist{font-size:.7rem;opacity:.8;margin-top:2px;}
    .mp-x{background:rgba(255,255,255,.2);border:none;color:#fff;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:.75rem;flex-shrink:0;}
    .mp-screen{background:#000;height:169px;position:relative;overflow:hidden;}
    .mp-screen img{width:100%;height:100%;object-fit:cover;opacity:.65;display:block;}
    .mp-screen .play-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;cursor:pointer;}
    .mp-screen .play-circle{width:52px;height:52px;border-radius:50%;background:rgba(229,57,53,.9);
      border:2px solid rgba(255,255,255,.6);color:#fff;font-size:1.5rem;
      display:flex;align-items:center;justify-content:center;}
    .mp-screen iframe{position:absolute;inset:0;width:100%;height:100%;border:none;display:none;}
    .mp-screen iframe.show{display:block;}
    .mp-ctrl{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-bottom:1px solid #f5f5f5;}
    .mp-btn{background:none;border:none;font-size:1.2rem;cursor:pointer;padding:4px 8px;border-radius:6px;}
    .mp-btn:hover{background:#f5f5f5;}
    .mp-num{font-size:.73rem;color:#999;}
    .mp-list{max-height:130px;overflow-y:auto;}
    .mp-item{padding:8px 14px;cursor:pointer;font-size:.79rem;display:flex;gap:7px;align-items:center;border-bottom:1px solid #f9f9f9;}
    .mp-item:hover{background:#fff5f5;}
    .mp-item.cur{background:#fde8e8;color:#c62828;font-weight:700;}
    .mp-item .mn{color:#ccc;font-size:.68rem;min-width:14px;}
  `;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  const bubble = document.createElement('button');
  bubble.id = 'musicBubble';
  bubble.innerHTML = '🎵';
  bubble.title = 'Azərbaycan Musiqisi';
  bubble.onclick = () => {
    const p = document.getElementById('musicPanel');
    if (p.style.display === 'block') { p.style.display = 'none'; } 
    else { renderPanel(); p.style.display = 'block'; }
  };
  document.body.appendChild(bubble);

  const panel = document.createElement('div');
  panel.id = 'musicPanel';
  document.body.appendChild(panel);

  function renderPanel() {
    const t = tracks[cur];
    panel.innerHTML = `
      <div class="mp-hd">
        <div>
          <div class="mp-title">${t.title}</div>
          <div class="mp-artist">${t.artist}</div>
        </div>
        <button class="mp-x" onclick="document.getElementById('musicPanel').style.display='none'">✕</button>
      </div>
      <div class="mp-screen" id="mpScreen">
        <img src="https://img.youtube.com/vi/${t.yt}/hqdefault.jpg" alt="${t.title}">
        <div class="play-overlay" onclick="playNow(${cur})">
          <div class="play-circle">▶</div>
        </div>
        <iframe id="mpFrame" src="" allow="autoplay; encrypted-media" allowfullscreen></iframe>
      </div>
      <div class="mp-ctrl">
        <button class="mp-btn" onclick="changeTrack(-1)">⏮</button>
        <span class="mp-num">${cur+1} / ${tracks.length}</span>
        <button class="mp-btn" onclick="changeTrack(1)">⏭</button>
      </div>
      <div class="mp-list">
        ${tracks.map((tt,i)=>`
          <div class="mp-item ${i===cur?'cur':''}" onclick="selectTrack(${i})">
            <span class="mn">${i+1}</span>
            <span>${tt.title}</span>
          </div>`).join('')}
      </div>`;
  }

  window.playNow = function(idx) {
    cur = idx;
    const t = tracks[cur];
    const frame = document.getElementById('mpFrame');
    const overlay = panel.querySelector('.play-overlay');
    const img = panel.querySelector('.mp-screen img');
    if (frame) {
      frame.src = `https://www.youtube-nocookie.com/embed/${t.yt}?autoplay=1&rel=0&modestbranding=1`;
      frame.classList.add('show');
      if (overlay) overlay.style.display = 'none';
      if (img) img.style.display = 'none';
      bubble.classList.add('on');
    }
  };

  window.changeTrack = function(d) {
    cur = (cur + d + tracks.length) % tracks.length;
    renderPanel();
  };

  window.selectTrack = function(idx) {
    cur = idx;
    renderPanel();
    setTimeout(() => playNow(idx), 80);
  };
})();
