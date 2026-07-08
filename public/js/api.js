const API = '/api';

function getToken(){ return localStorage.getItem('token'); }
function getUser(){ try{ return JSON.parse(localStorage.getItem('user')); }catch{ return null; } }
function logout(){ localStorage.removeItem('token'); localStorage.removeItem('user'); location.href='/index.html'; }

async function apiCall(path, method='GET', body=null){
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : null });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Xəta baş verdi');
  return data;
}

function requireAuth(){
  if (!getToken()) { location.href = '/index.html'; return null; }
  return getUser();
}

function initials(name){
  if(!name) return '?';
  return name.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();
}

function timeAgo(dateStr){
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'indicə';
  if (diff < 3600) return Math.floor(diff/60) + ' dəq əvvəl';
  if (diff < 86400) return Math.floor(diff/3600) + ' saat əvvəl';
  return d.toLocaleDateString('az-AZ');
}

const STATUS_LABELS = {
  pending: 'Gözləyir', in_progress: 'İcrada', completed: 'Tamamlandı',
  overdue: 'Gecikib', cancelled: 'Ləğv edilib'
};

// Sidebar-da tapşırıq sayğacını (qırmızı nişan) yükləyir
async function loadTaskBadge(){
  try {
    const user = getUser();
    if (!user) return;
    let tasks;
    if (user.role === 'admin') {
      // Admin üçün: bütün gözləyən/gecikmiş tapşırıqların sayı
      const sectors = await apiCall('/sectors');
      let total = 0;
      await Promise.all(sectors.map(async s => {
        const emps = await apiCall(`/sectors/${s.id}/employees`);
        emps.forEach(e => { total += e.stats.totalCount - e.stats.completedCount; });
      }));
      renderTaskBadge(total);
    } else {
      tasks = await apiCall('/tasks/mine');
      const open = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
      renderTaskBadge(open);
    }
  } catch(e) { /* səssiz */ }
}

function renderTaskBadge(count){
  const links = document.querySelectorAll('.sidebar a[href*="dashboard"], .sidebar a[href*="admin.html"]');
  links.forEach(link => {
    let badge = link.querySelector('.task-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'task-badge';
      badge.style.cssText = 'background:var(--red);color:#fff;font-size:.65rem;font-weight:800;min-width:18px;height:18px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;padding:0 4px;margin-left:auto;';
      link.style.display = 'flex';
      link.style.alignItems = 'center';
      link.appendChild(badge);
    }
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

// Bütün səhifələrdə avtomatik işlə
document.addEventListener('DOMContentLoaded', () => {
  if (getToken()) {
    setTimeout(loadTaskBadge, 800);
    setInterval(loadTaskBadge, 60000);
  }
});
