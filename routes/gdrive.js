const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken } = require('../middleware/auth');

// İstifadəçinin bu sənədə girişi varmı?
async function hasAccess(user, docId) {
  if (user.role === 'admin') return true;
  const { data: doc } = await supabase.from('gdrive_docs').select('added_by').eq('id', docId).single();
  if (doc?.added_by === user.id) return true;
  const { data: share } = await supabase.from('gdrive_doc_shares')
    .select('id').eq('doc_id', docId).eq('shared_with', user.id).single();
  return !!share;
}

// URL-dən Google Drive fayl ID-sini çıxar
function extractFileId(url) {
  const m = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  return m ? m[1] : null;
}

// URL-dən doc type müəyyən et
function detectDocType(url) {
  if (url.includes('docs.google.com/document'))     return 'doc';
  if (url.includes('docs.google.com/spreadsheets')) return 'sheet';
  if (url.includes('docs.google.com/presentation')) return 'slide';
  if (url.includes('docs.google.com/forms'))        return 'form';
  return 'other';
}

// ─── SƏNƏDLƏR ────────────────────────────────────────────────

// BÜTÜN SƏNƏDLƏR (admin hamısını, işçi yalnız öz + paylaşılanları görür)
router.get('/', verifyToken, async (req, res) => {
  let docIds = null;

  if (req.user.role !== 'admin') {
    const { data: myDocs } = await supabase.from('gdrive_docs')
      .select('id').eq('added_by', req.user.id);
    const { data: sharedDocs } = await supabase.from('gdrive_doc_shares')
      .select('doc_id').eq('shared_with', req.user.id);
    docIds = [
      ...(myDocs || []).map(d => d.id),
      ...(sharedDocs || []).map(d => d.doc_id)
    ];
    if (docIds.length === 0) return res.json([]);
  }

  let query = supabase.from('gdrive_docs')
    .select('*, employees(full_name, photo_url)')
    .order('created_at', { ascending: false });
  if (docIds) query = query.in('id', docIds);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });

  // Hər sənəd üçün paylaşım siyahısını da əlavə edək
  const result = await Promise.all((data || []).map(async doc => {
    const { data: shares } = await supabase.from('gdrive_doc_shares')
      .select('shared_with, employees(full_name, photo_url)')
      .eq('doc_id', doc.id);
    const { count } = await supabase.from('gdrive_doc_comments')
      .select('id', { count: 'exact', head: true }).eq('doc_id', doc.id);
    return { ...doc, shares: shares || [], comment_count: count || 0 };
  }));

  res.json(result);
});

// ƏLAVƏ ET
router.post('/', verifyToken, async (req, res) => {
  const { title, url, description } = req.body;
  if (!title || !url) return res.status(400).json({ error: 'Başlıq və link tələb olunur' });
  if (!url.startsWith('https://')) return res.status(400).json({ error: 'Düzgün HTTPS link daxil edin' });
  const doc_type = detectDocType(url);
  const { data, error } = await supabase.from('gdrive_docs')
    .insert([{ title, url, description, doc_type, added_by: req.user.id }])
    .select('*, employees(full_name, photo_url)').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ...data, shares: [], comment_count: 0 });
});

// AD DƏYİŞ
router.patch('/:id', verifyToken, async (req, res) => {
  const { title, folder_id } = req.body;
  const { data: doc } = await supabase.from('gdrive_docs').select('added_by').eq('id', req.params.id).single();
  if (!doc) return res.status(404).json({ error: 'Sənəd tapılmadı' });
  if (doc.added_by !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'İcazə yoxdur' });
  const update = {};
  if (title !== undefined) update.title = title.trim();
  if (folder_id !== undefined) update.folder_id = folder_id;
  const { data, error } = await supabase.from('gdrive_docs')
    .update(update).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ─── QOVLUQLAR ───────────────────────────────────────────────
router.get('/folders', verifyToken, async (req, res) => {
  const { data, error } = await supabase.from('gdrive_folders')
    .select('*, employees(full_name)').order('name');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data || []);
});

router.post('/folders', verifyToken, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Ad tələb olunur' });
  const { data, error } = await supabase.from('gdrive_folders')
    .insert([{ name: name.trim(), created_by: req.user.id }]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/folders/:id', verifyToken, async (req, res) => {
  const { data: folder } = await supabase.from('gdrive_folders').select('created_by').eq('id', req.params.id).single();
  if (!folder) return res.status(404).json({ error: 'Tapılmadı' });
  if (folder.created_by !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'İcazə yoxdur' });
  // Sənədləri qovluqsuz et
  await supabase.from('gdrive_docs').update({ folder_id: null }).eq('folder_id', req.params.id);
  await supabase.from('gdrive_folders').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// SİL
router.delete('/:id', verifyToken, async (req, res) => {
  const { data: doc } = await supabase.from('gdrive_docs').select('*').eq('id', req.params.id).single();
  if (!doc) return res.status(404).json({ error: 'Sənəd tapılmadı' });
  if (doc.added_by !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'İcazə yoxdur' });
  await supabase.from('gdrive_docs').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// ─── PAYLAŞIM ─────────────────────────────────────────────────

// PAYLAŞ (işçi seçib göndər)
router.post('/:id/share', verifyToken, async (req, res) => {
  const { employee_ids } = req.body; // array
  if (!Array.isArray(employee_ids) || !employee_ids.length)
    return res.status(400).json({ error: 'Ən azı bir işçi seçin' });

  const doc = await supabase.from('gdrive_docs').select('added_by').eq('id', req.params.id).single();
  if (!doc.data) return res.status(404).json({ error: 'Sənəd tapılmadı' });
  if (doc.data.added_by !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Yalnız sənədi yaradan paylaşa bilər' });

  const rows = employee_ids
    .filter(id => id !== req.user.id)
    .map(id => ({ doc_id: req.params.id, shared_with: id, shared_by: req.user.id }));

  const { error } = await supabase.from('gdrive_doc_shares').upsert(rows, { onConflict: 'doc_id,shared_with' });
  if (error) return res.status(400).json({ error: error.message });

  // Paylaşılan işçiyə bildiriş mesajı göndər
  await Promise.all(employee_ids.map(empId =>
    supabase.from('messages').insert([{
      sender_id: req.user.id,
      receiver_id: empId,
      content: `📎 "${doc.data.title || 'Sənəd'}" adlı Google Drive sənədi sizinlə paylaşıldı. Workspace bölməsindən baxa bilərsiniz.`
    }])
  ));

  res.json({ success: true });
});

// PAYLAŞIMI GÖTÜR
router.delete('/:id/share/:empId', verifyToken, async (req, res) => {
  const doc = await supabase.from('gdrive_docs').select('added_by').eq('id', req.params.id).single();
  if (doc.data?.added_by !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'İcazə yoxdur' });
  await supabase.from('gdrive_doc_shares')
    .delete().eq('doc_id', req.params.id).eq('shared_with', req.params.empId);
  res.json({ success: true });
});

// ─── ŞƏRHLƏR ──────────────────────────────────────────────────

router.get('/:id/comments', verifyToken, async (req, res) => {
  if (!await hasAccess(req.user, req.params.id))
    return res.status(403).json({ error: 'İcazə yoxdur' });
  const { data, error } = await supabase.from('gdrive_doc_comments')
    .select('*, employees(full_name, photo_url)')
    .eq('doc_id', req.params.id).order('created_at');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/:id/comments', verifyToken, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Şərh boş ola bilməz' });
  if (!await hasAccess(req.user, req.params.id))
    return res.status(403).json({ error: 'İcazə yoxdur' });
  const { data, error } = await supabase.from('gdrive_doc_comments')
    .insert([{ doc_id: req.params.id, author_id: req.user.id, content: content.trim() }])
    .select('*, employees(full_name, photo_url)').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.patch('/:id/comments/:cid', verifyToken, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Şərh boş ola bilməz' });
  const { data: c } = await supabase.from('gdrive_doc_comments').select('*').eq('id', req.params.cid).single();
  if (!c) return res.status(404).json({ error: 'Şərh tapılmadı' });
  if (c.author_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Yalnız öz şərhinizi redaktə edə bilərsiniz' });
  const { data, error } = await supabase.from('gdrive_doc_comments')
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq('id', req.params.cid).select('*, employees(full_name, photo_url)').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/:id/comments/:cid', verifyToken, async (req, res) => {
  const { data: c } = await supabase.from('gdrive_doc_comments').select('*').eq('id', req.params.cid).single();
  if (!c) return res.status(404).json({ error: 'Tapılmadı' });
  if (c.author_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'İcazə yoxdur' });
  await supabase.from('gdrive_doc_comments').delete().eq('id', req.params.cid);
  res.json({ success: true });
});

module.exports = router;
