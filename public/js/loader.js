// PS1 Playstation 1 stili loading screen
(function(){
  if (sessionStorage.getItem('ps1_loaded')) return;

  const css = `
    @keyframes disc-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes bar-fill{from{width:0}to{width:100%}}
    @keyframes ps1-out{0%{opacity:1}100%{opacity:0;pointer-events:none;visibility:hidden}}
    @keyframes ps1-flicker{0%,100%{opacity:1}50%{opacity:.85}}
    #ps1-screen{
      position:fixed;inset:0;background:#000;z-index:999999;
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;
    }
    .ps1-logo{
      font-family:monospace;font-size:2.2rem;font-weight:900;letter-spacing:10px;
      color:#00d4ff;text-shadow:0 0 20px #00d4ff,0 0 40px #0088ff,0 0 80px #0044cc;
      animation:ps1-flicker 2s infinite;
    }
    .ps1-sub{font-family:monospace;font-size:.65rem;color:#444;letter-spacing:4px;margin-top:-20px;}
    .ps1-disc-wrap{position:relative;width:90px;height:90px;}
    .ps1-disc{
      width:90px;height:90px;border-radius:50%;
      background:conic-gradient(#888 0deg,#444 60deg,#bbb 120deg,#333 180deg,#999 240deg,#555 300deg,#888 360deg);
      animation:disc-spin .8s linear infinite;
      box-shadow:0 0 30px rgba(255,255,255,.1);
    }
    .ps1-disc-hole{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;background:#111;border:2px solid #333;}
    .ps1-disc-shine{position:absolute;top:10px;left:15px;width:25px;height:12px;border-radius:50%;background:rgba(255,255,255,.15);transform:rotate(-30deg);}
    .ps1-bar-wrap{width:220px;height:5px;background:#111;border:1px solid #333;border-radius:3px;overflow:hidden;}
    .ps1-bar{height:100%;background:linear-gradient(90deg,#00d4ff,#7b68ee);animation:bar-fill 2.2s ease-out forwards;}
    .ps1-dots{font-family:monospace;font-size:.65rem;color:#444;letter-spacing:4px;}
    .ps1-corner{position:fixed;bottom:20px;right:20px;font-family:monospace;font-size:.5rem;color:#222;letter-spacing:2px;}
    #ps1-screen.ps1-hide{animation:ps1-out .6s ease forwards;}
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.id = 'ps1-screen';
  el.innerHTML = `
    <div class="ps1-logo">GDRTI</div>
    <div class="ps1-sub">PERFORMANS İDARƏETMƏ SİSTEMİ</div>
    <div class="ps1-disc-wrap">
      <div class="ps1-disc"></div>
      <div class="ps1-disc-hole"></div>
      <div class="ps1-disc-shine"></div>
    </div>
    <div class="ps1-bar-wrap"><div class="ps1-bar"></div></div>
    <div class="ps1-dots">LOADING...</div>
    <div class="ps1-corner">© GDRTI 2026</div>
  `;

  function attach(){
    if (document.body) {
      document.body.insertBefore(el, document.body.firstChild);
      setTimeout(() => {
        el.classList.add('ps1-hide');
        setTimeout(() => { el.remove(); sessionStorage.setItem('ps1_loaded','1'); }, 600);
      }, 2800);
    }
  }

  if (document.body) { attach(); }
  else { document.addEventListener('DOMContentLoaded', attach); }
})();
