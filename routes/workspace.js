const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken } = require('../middleware/auth');

// BÜTÜN SƏNƏDLƏR
router.get('/', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('workspace_docs')
    .select('id, title, created_by, updated_by, created_at, updated_at, employees!workspace_docs_created_by_fkey(full_name), updated:employees!workspace_docs_updated_by_fkey(full_name)')
    .order('updated_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// TƏK SƏNƏD (məzmun ilə)
router.get('/:id', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('workspace_docs')
    .select('*, employees!workspace_docs_created_by_fkey(full_name), updated:employees!workspace_docs_updated_by_fkey(full_name)')
    .eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Sənəd tapılmadı' });
  res.json(data);
});

// YARAT
router.post('/', verifyToken, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Başlıq tələb olunur' });
  const { data, error } = await supabase
    .from('workspace_docs')
    .insert([{ title, content: '', created_by: req.user.id, updated_by: req.user.id }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// SAXLA (auto-save)
router.patch('/:id', verifyToken, async (req, res) => {
  const { content, title } = req.body;
  const update = { updated_by: req.user.id, updated_at: new Date().toISOString() };
  if (content !== undefined) update.content = content;
  if (title) update.title = title;
  const { data, error } = await supabase
    .from('workspace_docs')
    .update(update).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// SİL (yalnız yaradan ya admin)
router.delete('/:id', verifyToken, async (req, res) => {
  const { data: doc } = await supabase.from('workspace_docs').select('*').eq('id', req.params.id).single();
  if (!doc) return res.status(404).json({ error: 'Sənəd tapılmadı' });
  if (doc.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'İcazə yoxdur' });
  }
  const { error } = await supabase.from('workspace_docs').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
