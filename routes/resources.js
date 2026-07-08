const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { verifyToken } = require('../middleware/auth');

// SİYAHI (fayl datası olmadan — sürətli yüklənsin)
router.get('/', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('resources')
    .select('id, uploaded_by, title, description, category, file_name, file_type, created_at, employees(full_name)')
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// YÜKLƏ (istənilən işçi)
router.post('/', verifyToken, async (req, res) => {
  const { title, description, category, file_name, file_type, file_data } = req.body;
  if (!title || !file_name || !file_data) return res.status(400).json({ error: 'Başlıq və fayl tələb olunur' });
  if (file_data.length > 7_000_000) return res.status(413).json({ error: 'Fayl çox böyükdür (maks. ~5MB)' });

  const { data, error } = await supabase
    .from('resources')
    .insert([{ uploaded_by: req.user.id, title, description, category: category || 'ümumi', file_name, file_type, file_data }])
    .select('id, uploaded_by, title, description, category, file_name, file_type, created_at')
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// FAYLI ENDİR (tam data ilə, tək resurs)
router.get('/:id/download', verifyToken, async (req, res) => {
  const { data, error } = await supabase.from('resources').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Resurs tapılmadı' });
  res.json(data);
});

// SİL (yalnız yükləyən, ya admin)
router.delete('/:id', verifyToken, async (req, res) => {
  const { data: resource } = await supabase.from('resources').select('*').eq('id', req.params.id).single();
  if (!resource) return res.status(404).json({ error: 'Resurs tapılmadı' });
  if (resource.uploaded_by !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'İcazə yoxdur' });

  const { error } = await supabase.from('resources').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
