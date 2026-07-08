// Google Drive API inteqrasiyası
// Token Google OAuth zamanı alınır və localStorage-da saxlanılır

const GDRIVE_TOKEN_KEY = 'gdrive_token';
const GDRIVE_TOKEN_EXPIRY_KEY = 'gdrive_token_expiry';

const MIME_TYPES = {
  doc:   'application/vnd.google-apps.document',
  sheet: 'application/vnd.google-apps.spreadsheet',
  slide: 'application/vnd.google-apps.presentation',
  form:  'application/vnd.google-apps.form'
};

const DOC_URLS = {
  doc:   id => `https://docs.google.com/document/d/${id}/edit?rm=minimal`,
  sheet: id => `https://docs.google.com/spreadsheets/d/${id}/edit?rm=minimal`,
  slide: id => `https://docs.google.com/presentation/d/${id}/edit?rm=minimal`,
  form:  id => `https://docs.google.com/forms/d/${id}/edit`
};

const DOC_ICONS = {
  doc:   '📘', sheet: '📗', slide: '📙', form: '📋', other: '📄'
};
const DOC_NAMES = {
  doc: 'Google Doc', sheet: 'Google Sheet', slide: 'Google Slide', form: 'Google Form', other: 'Fayl'
};

// Token saxla (login zamanı çağırılır)
function saveGDriveToken(token, expiresIn = 3600){
  if (!token) return;
  localStorage.setItem(GDRIVE_TOKEN_KEY, token);
  localStorage.setItem(GDRIVE_TOKEN_EXPIRY_KEY, Date.now() + (expiresIn - 60) * 1000);
}

// Token al (keçərlilik yoxlanır)
function getGDriveToken(){
  const token = localStorage.getItem(GDRIVE_TOKEN_KEY);
  const expiry = parseInt(localStorage.getItem(GDRIVE_TOKEN_EXPIRY_KEY) || '0');
  if (!token || Date.now() > expiry) return null;
  return token;
}

function clearGDriveToken(){
  localStorage.removeItem(GDRIVE_TOKEN_KEY);
  localStorage.removeItem(GDRIVE_TOKEN_EXPIRY_KEY);
}

// Drive API sorğusu göndər
async function driveApiCall(path, method = 'GET', body = null){
  const token = getGDriveToken();
  if (!token) throw new Error('Google Drive girişi tələb olunur. Yenidən Google ilə daxil olun.');
  const res = await fetch(`https://www.googleapis.com/drive/v3${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : null
  });
  if (!res.ok) {
    const err = await res.json();
    if (res.status === 401) { clearGDriveToken(); throw new Error('Google token-i vaxtı bitib. Yenidən daxil olun.'); }
    throw new Error(err.error?.message || 'Google Drive xətası');
  }
  return res.json();
}

// Yeni Google Doc/Sheet/Slide yarat
async function createGDriveFile(title, type){
  const mimeType = MIME_TYPES[type];
  if (!mimeType) throw new Error('Naməlum fayl tipi');

  // Faylı yarat
  const file = await driveApiCall('/files', 'POST', {
    name: title,
    mimeType
  });

  // "İstənilən şəxs redaktə edə bilər" icazəsi ver
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getGDriveToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'writer', type: 'anyone' })
    });
  } catch(e) { /* icazə vermək uğursuz olsa belə davam et */ }

  return {
    google_doc_id: file.id,
    url: DOC_URLS[type](file.id),
    doc_type: type
  };
}

// İstifadəçinin son Drive fayllarını siyahısını al
async function listMyDriveFiles(maxResults = 20){
  const types = Object.values(MIME_TYPES).join(' or mimeType = ');
  const q = `(mimeType = '${Object.values(MIME_TYPES).join("' or mimeType = '")}') and trashed = false`;
  const data = await driveApiCall(
    `/files?q=${encodeURIComponent(q)}&orderBy=modifiedTime desc&pageSize=${maxResults}&fields=files(id,name,mimeType,modifiedTime,webViewLink)`
  );
  return (data.files || []).map(f => {
    const type = Object.entries(MIME_TYPES).find(([, v]) => v === f.mimeType)?.[0] || 'other';
    return { ...f, type, url: DOC_URLS[type]?.(f.id) || f.webViewLink };
  });
}

// URL-dən doc tipini müəyyən et
function detectDocType(url){
  if (url.includes('docs.google.com/document')) return 'doc';
  if (url.includes('docs.google.com/spreadsheets') || url.includes('sheets.google.com')) return 'sheet';
  if (url.includes('docs.google.com/presentation') || url.includes('slides.google.com')) return 'slide';
  if (url.includes('docs.google.com/forms') || url.includes('forms.google.com')) return 'form';
  return 'other';
}

// URL-dən doc ID çıxar
function extractDocId(url){
  const m = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  return m ? m[1] : null;
}
